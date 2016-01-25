/// <reference path="../../typings/tsd.d.ts"/>

// Load the Angular Material CSS associated with ngMaterial
// then load the main.css to provide overrides, etc.

import 'bootstrap/css/bootstrap.min.css!';
import 'bootstrap/css/bootstrap-theme.min.css!';

import 'jquery';
import 'bootstrap';
import 'babel-polyfill/dist/polyfill.min';

// Load Angular libraries

import * as angular from 'angular';

// Load custom application modules

import main from './main/main';

angular
  .element(document)
  .ready(() => {
    let body = document.getElementsByTagName("body")[0];
    let app = angular
      .module('charon', [main]);
    angular.bootstrap(body, [app.name], { strictDi: false });
  });
