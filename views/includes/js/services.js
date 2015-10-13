/**
 * Created by swisa on 09/10/2015.
 */

var app = angular.module('dorbelApp.services', []);

app.service('my_map', function($rootScope){

    var apartments = [];
    var aps_list_scrolled = false;

    this.set_apartments = function(items){
        apartments = items;
        //$rootScope.$broadcast('apartmentsCount', apartments.length);
    };

    this.get_apartments = function(){
        return apartments;
    };

    this.set_aps_list_scrolled = function(state){
        aps_list_scrolled = state;
    };

    this.get_aps_list_scrolled = function(){
        return aps_list_scrolled;
    }

});