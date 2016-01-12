///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

'use strict';

import * as sequelize from 'sequelize';
const Sequelize = require('sequelize');

import * as Q from 'q';
import * as mysql from 'mysql';
import {DataAccessUser} from '../lib/db/users';
import {DataAccessPassword} from '../lib/db/passwds';

const charonDBName: string = 'charon';
const certsDBTableName: string = 'certs';

var connection: mysql.IConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root'
});

function resetDatabase(): Q.Promise<any> {
  return Q.ninvoke(connection, 'query', 'DROP DATABASE IF EXISTS ' + charonDBName)
    .then(() => {
    return Q.ninvoke(connection, 'query', 'CREATE DATABASE ' + charonDBName);
  })
    .then(() => {
    return Q.ninvoke(connection, 'end');
  });
}

resetDatabase()
  .then(() => {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: charonDBName
  });
})
  .then(() => {
  // create certificates table
  return Q.ninvoke(connection, 'query', 'CREATE TABLE ' + certsDBTableName + ' ('
    + 'serial INTEGER NOT NULL AUTO_INCREMENT,'
    + 'state varchar(64) NOT NULL,'
    + 'revoked BOOLEAN DEFAULT false,'
    + 'PRIMARY KEY(serial)' + ')')
}).done(() => {
  connection.end();
});

var charonSequelize: sequelize.Sequelize = new Sequelize('charon', 'root');
var userDataModel = new DataAccessUser(charonSequelize).model;
var passwordDataModel = new DataAccessPassword(charonSequelize, userDataModel).model;

userDataModel.sync({ force: true })
  .then((result) => {
  return passwordDataModel.sync({ force: true });
})
  .then((result) => {
});
