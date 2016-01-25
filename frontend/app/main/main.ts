/// <reference path="../../../typings/tsd.d.ts"/>

import * as angular from 'angular';
import 'angular-route';
import 'angular-resource';

import {UsersController, UsersControllerName} from '../users/users';
import {networksController, networksControllerName} from '../networks/networks';

import {charonServicesFactory, charonServicesName} from '../services/services';

class MainController {
  constructor($scope: angular.IScope) {
  }
}

function routes($routeProvider: angular.route.IRouteProvider, $locationProvider: angular.ILocationProvider) {
  $routeProvider
    .when('/users', {
      templateUrl: 'app/users/view/users.html',
      controller: UsersControllerName
    })
    .when('/networks', {
      templateUrl: 'app/networks/view/networks.html',
      controller: networksControllerName
    });

  $locationProvider.html5Mode(true);
}

const mainModule: angular.IModule = angular.module('main', ['ngRoute', 'ngResource'])
  .config(['$routeProvider', '$locationProvider', routes])
  .factory(charonServicesName, charonServicesFactory)
  .controller('MainController', ['$scope', MainController])
  .controller(UsersControllerName, UsersController)
  .controller(networksControllerName, networksController);

export default mainModule.name
