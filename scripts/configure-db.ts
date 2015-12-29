///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

'use strict';

import * as sequelize from 'sequelize';
import * as Q from 'q';
import * as mysql from 'mysql';
import {DataAccessUser} from '../lib/db/users';

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

var sqlize: sequelize.Sequelize = new sequelize('charon', 'root');
new DataAccessUser(sqlize).model.sync({ force: true }).then((result) => {
  console.log(result);
});
