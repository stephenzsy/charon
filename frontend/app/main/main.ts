/// <reference path="../../../typings/tsd.d.ts"/>

import * as angular from 'angular';
import 'angular-route';
import 'angular-resource';

import {controller as usersController, name as usersControllerName,
  userController, userControllerName} from '../users/users';
import {controller as networksController, name as networksControllerName} from '../networks/networks';

import {charonServicesFactory, charonServicesName} from '../services/services';

class MainController {
  constructor($scope: angular.IScope, $route: angular.route.IRouteService) {
    $route.reload();
  }
}

function routes($routeProvider: angular.route.IRouteProvider, $locationProvider: angular.ILocationProvider) {
  $routeProvider
    .when('/users', {
      templateUrl: 'app/users/view/users.html',
      controller: usersControllerName
    })
    .when('/users/:id', {
      templateUrl: 'app/users/view/user.html',
      controller: userControllerName
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
  .controller('MainController', ['$scope', '$route', MainController])
  .controller(usersControllerName, usersController)
  .controller(userControllerName, userController)
  .controller(networksControllerName, networksController);

export default mainModule.name
