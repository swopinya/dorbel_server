/**
 * Created by Shimon on 07/10/2015.
 */
var app = angular.module('dorbelApp.controllers', [
    'dorbelApp.services'
]);
var base_url = 'http://dorbel-server.herokuapp.com';
//var base_url = 'http://localhost:3000';

var DATES = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
var date_sort_state = rooms_sort_state = sm_sort_state = price_sort_state = enter_sort_state = 'DES';

app.controller('ListCtrl', function ($scope, $rootScope, $http, $filter, my_map) {

    var orderBy = $filter('orderBy');

    $http.get(base_url + '/apartments-list').then(
        function success(res) {
            var aps = [], arr = res.data;
            for(var i = 0 in arr){
                arr[i] = set_published_str(arr[i]);
                set_enter_str(arr[i]);
                aps.push(arr[i]);
            }
            $scope.count = aps.length;
            $scope.apartments = aps;
            my_map.set_apartments(aps);
        },
        function error(res) {
            console.log(res);
        }
    );

    $scope.order = function(predicate, sort_by) {
        order_list($scope, orderBy, predicate, sort_by);
        $rootScope.$broadcast('listFiltered');
    };

});

function set_published_str(ap){
    var count_type = '';
    var publish = ap.publish;
    if(publish >= 24) {
        publish = parseInt(publish / 24)+1;
        count_type = ' ימים';
    }
    else count_type = ' שעות';
    ap.published_str = 'הועלה לפני '+publish+count_type;
    ap.publish_type = count_type.replace(/\s/g, '');
    return ap;
}

function set_enter_str(ap){
    ap.enter_date_str = ap.enter_date.day + ' ' + 'ב' + DATES[ap.enter_date.month-1] + ', ' + ap.enter_date.year;
    return ap;
}

app.directive('checkLast', function ($rootScope, my_map) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (scope.$last === true) {
                var onscreen_apartments = [];
                element.ready(function () {  // or maybe $timeout
                    $('.row').onScreen({
                        container: $('.col:nth-child(1)'),
                        direction: 'vertical',
                        doIn: function () {
                            my_map.set_aps_list_scrolled(true);
                            $rootScope.$broadcast('apartmentsRendered', generate_onscreen());
                            scope.$apply();
                        },
                        doOut: function () {
                            my_map.set_aps_list_scrolled(true);
                            $rootScope.$broadcast('apartmentsRendered', generate_onscreen());
                            scope.$apply();
                        },
                        tolerance: 0,
                        throttle: 50,
                        toggleClass: 'onScreen',
                        lazyAttr: null,
                        lazyPlaceholder: 'someImage.jpg',
                        debug: false
                    });
                    function generate_onscreen() {
                        var arr = [];
                        $.each($('.row'), function (i) {
                            if ($(this).hasClass('onScreen')) {
                                arr.push(scope.apartments[i]);
                            }
                        });
                        return arr;
                    }

                    $rootScope.$on('listFiltered', function(){
                        onscreen_apartments = [];
                        if(! my_map.get_aps_list_scrolled()){
                            $.each($('.row'), function (i) {
                                if (!$('.col').isChildOverflowing('.row:eq(' + i + ')')) onscreen_apartments.push(scope.apartments[i]);
                            });
                        }
                        else{
                            $.each($('.row'), function (i) {
                                if (this.isVisible(this)) onscreen_apartments.push(scope.apartments[i]);
                            });
                        }
                        $rootScope.$broadcast('apartmentsRendered', onscreen_apartments);
                    });

                    $.each($('.row'), function (i) {
                        if (!$('.col').isChildOverflowing('.row:eq(' + i + ')')) onscreen_apartments.push(scope.apartments[i]);
                    });
                    $rootScope.$broadcast('apartmentsRendered', onscreen_apartments);
                });
            }
        }
    }
});

app.controller('MapCtrl', function ($scope, $rootScope, uiGmapGoogleMapApi, uiGmapLogger, uiGmapIsReady) {

    var apartments = [];
    $rootScope.$on('apartmentsRendered', function (e, aps) {
        apartments = aps;
        generate_markers();
        fit_markers();
    });

    function generate_markers() {
        var markers = [];
        for (var i = 0; i < apartments.length; i++) {
            markers.push(create_marker(i, apartments[i].point))
        }
        $scope.markers = markers;
    }

    function create_marker(i, point, idKey) {
        var ret = {
            latitude: point.latitude,
            longitude: point.longitude,
            title: 'm' + i,
            events: {
                mouseover: function(e){
                    var map_pos = $('.angular-google-map-container').position();
                    var top = map_pos.top + 20;
                    var left = map_pos.left;
                    var apt = apartments[i];
                    var $map_tooltip = $('.map-tooltip');
                    $scope.image_src = apt.image;
                    $scope.address = apt.address.street + ', ' + apt.address.city + ' | ' + apt.address.area;
                    $map_tooltip.css({
                        'position': 'absolute',
                        'top': top + 'px',
                        'left': left + 'px'
                    }).toggle();

                },
                mouseout: function(e){
                    var $map_tooltip = $('.map-tooltip');
                    $scope.address = '';
                    $scope.image_src = '';
                    $map_tooltip.toggle();
                }
            }
        };
        idKey = 'id';
        ret[idKey] = i;
        return ret;
    }
    function fit_markers(){
        var markers = $scope.markers;
        var lat_arr = [], lon_arr = [];
        for(var i = 0 in markers){
            lat_arr.push(markers[i].latitude);
            lon_arr.push(markers[i].longitude);
        }
        $scope.map.bounds = {
            northeast: { latitude: Math.max.apply(Math,lat_arr), longitude: Math.max.apply(Math,lon_arr) },
            southwest: { latitude: Math.min.apply(Math,lat_arr), longitude: Math.min.apply(Math,lon_arr) }
        };
    }

    // Google Maps SDK ready event
    uiGmapGoogleMapApi.then(function(maps){});

    // This service lets you know when ui-gmap is ready
    uiGmapIsReady.promise(1).then(function (instances) {
        instances.forEach(function (inst) {
            var map = inst.map; // The actual gMap (google map sdk instance of the google.maps.Map).
            var uuid = map.uiGmap_id; // A unique UUID that gets assigned to the gMap via ui-gamp api.
            var mapInstanceNumber = inst.instance; // Starts at 1. map instance number (internal counter for ui-gmap on which map)
        });
    });

    var dragstart = function () {
        //console.log('dragstart');
    };
    var drag = function () {
        //console.log('drag');
    };
    var dragend = function () {
        //console.log('dragend');
    };
    var bounds_changed = function () {
        //console.log('bounds_changed');
    };

    $scope.map = {
        center: {latitude: "32.090882", longitude: "34.783277"},
        zoom: 15,
        events: {
            dragstart: dragstart,
            drag: drag, // fires one last time when drag stops and mouse key up
            dragend: dragend,
            bounds_changed: bounds_changed // fires one time when the map is loaded - check why // fires also when mouse wheel zooming in/out
        },
        bounds: {}
    };

});

function order_list($scope, orderBy, predicate, sort_by){
    reset_marks($scope);
    if(sort_by == 'DATE'){
        if(date_sort_state == 'DES'){
            date_sort_state = 'ASC';
            $scope.date_sort_mark = '▼';
            $scope.apartments = orderBy($scope.apartments, predicate);
        }
        else{
            date_sort_state = 'DES';
            $scope.date_sort_mark = '▲';
            $scope.apartments = orderBy($scope.apartments, predicate, 'reverse');
        }
    }
    if(sort_by == 'ROOMS'){
        if(rooms_sort_state == 'DES'){
            rooms_sort_state = 'ASC';
            $scope.rooms_sort_mark = '▼';
            $scope.apartments = orderBy($scope.apartments, predicate);
        }
        else{
            rooms_sort_state = 'DES';
            $scope.rooms_sort_mark = '▲';
            $scope.apartments = orderBy($scope.apartments, predicate, 'reverse');
        }
    }
    if(sort_by == 'SQUARE_METERS'){
        if(sm_sort_state == 'DES'){
            sm_sort_state = 'ASC';
            $scope.sm_sort_mark = '▼';
            $scope.apartments = orderBy($scope.apartments, predicate);
        }
        else{
            sm_sort_state = 'DES';
            $scope.sm_sort_mark = '▲';
            $scope.apartments = orderBy($scope.apartments, predicate, 'reverse');
        }
    }
    if(sort_by == 'PRICE'){
        if(price_sort_state == 'DES'){
            price_sort_state = 'ASC';
            $scope.price_sort_mark = '▼';
            $scope.apartments = orderBy($scope.apartments, predicate);
        }
        else{
            price_sort_state = 'DES';
            $scope.price_sort_mark = '▲';
            $scope.apartments = orderBy($scope.apartments, predicate, 'reverse');
        }
    }
    if(sort_by == 'ENTER_DATE'){
        if(enter_sort_state == 'DES'){
            enter_sort_state = 'ASC';
            $scope.enter_sort_mark = '▼';
            $scope.apartments = orderBy($scope.apartments, predicate);
        }
        else{
            enter_sort_state = 'DES';
            $scope.enter_sort_mark = '▲';
            $scope.apartments = orderBy($scope.apartments, predicate, 'reverse');
        }
    }
}

function reset_marks($scope){
    $scope.date_sort_mark = '';
    $scope.rooms_sort_mark = '';
    $scope.sm_sort_mark = '';
    $scope.price_sort_mark = '';
    $scope.enter_sort_mark = '';
}
