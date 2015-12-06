///<reference path="../../typings/angularjs/angular.d.ts"/>
///<reference path="../../typings/angularjs/angular-route.d.ts"/>

'use strict';

var app: ng.IModule = angular.module('charon', ['ngRoute']);
app.config(['$routeProvider', '$locationProvider', function($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.when('/', {
    templateUrl: 'views/_welcome.html',
    controller: 'WelcomeController'
  }).when('/admin', {
    templateUrl: 'views/_admin.html',
    controller: 'AdminController'
  });
}]);

app.controller('WelcomeController', function() {
});

app.controller('AdminController', function() {
});
