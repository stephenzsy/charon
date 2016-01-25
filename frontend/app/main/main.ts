/// <reference path="../../../typings/tsd.d.ts"/>

import * as angular from 'angular';
import 'angular-route';
import {UsersController, UsersControllerName} from '../users/users';
import {NetworksController, NetworksControllerName} from '../networks/networks';

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
      controller: UsersControllerName
    });

  $locationProvider.html5Mode(true);
}

const module: angular.IModule = angular.module('main', ['ngRoute'])
  .controller('MainController', ['$scope', MainController])
  .controller(UsersControllerName, UsersController)
  .controller(NetworksControllerName, NetworksController)
  .config(['$routeProvider', '$locationProvider', routes]);

export default module.name
