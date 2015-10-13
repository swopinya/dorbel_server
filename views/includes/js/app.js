/**
 * Created by Shimon on 07/10/2015.
 */
var app = angular.module('dorbelApp', [
    'ui.router',
    'uiGmapgoogle-maps',
    'dorbelApp.services',
    'dorbelApp.controllers'
]);

app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('browse', {
            url: '/browse',
            templateUrl: 'templates/browse.html',
            controller: 'ListCtrl'
        });

    $urlRouterProvider.otherwise('/browse');

});

app.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.20', //defaults to latest 3.X anyhow
        libraries: 'weather,geometry,visualization'
    });
});