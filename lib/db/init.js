/**
 * Written directly in ES2015 script to avoid sequelize babel
 */
'use strict';

var Sequelize = require('sequelize');

exports.charonSequelize = new Sequelize(
  'charon', // database
  'root' // user
);
