///<reference path="../../typings/angularjs/angular.d.ts"/>
///<reference path="../../typings/angularjs/angular-route.d.ts"/>
///<reference path="../../typings/angularjs/angular-resource.d.ts"/>

'use strict';

var app: ng.IModule = angular.module('charon', ['ngRoute', 'ngResource']);
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

interface WelcomeControllerScope extends ng.IScope {
  caCertMetadata: string;
}

app.controller('WelcomeController', function($scope: WelcomeControllerScope, $resource: ng.resource.IResourceService) {
  var CaCert = $resource('/api/certs/ca');
  console.log(CaCert.get());
});

app.controller('AdminController', function() {
});
