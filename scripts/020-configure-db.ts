///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import * as fsExtra from 'fs-extra';
import * as Sequelize from 'sequelize';
const _Sequelize = require('sequelize');

import SecretUtils from '../lib/secrets/utils';
import AppConfig, {Constants as ConfigConstants, DbConfig} from '../lib/config/config';

import {sqlCharonSetup} from './init';

export async function configure() {
  try {
    await sqlCharonSetup.userModel.sync();
    await sqlCharonSetup.passwordModel.sync();
    await sqlCharonSetup.certModel.sync();
    await sqlCharonSetup.permissionModel.sync();
    await configureDbUser();
    sqlCharonSetup.sql.close();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

function getCreateUserQuery(user: string, host: string, password: string): string {
  return "CREATE USER '" + user + "'@'" + host + "'"
    + " IDENTIFIED BY '" + password + "'";
}

function getDropUserQuery(user: string, host: string): string {
  return "DROP USER '" + user + "'@'" + host + "'";
}

function getGrantUserQuery(user: string, host: string): string {
  return "GRANT SELECT,INSERT,UPDATE,DELETE on charon.* to '" + user + "'@'" + host + "'"
}

async function dropUserIfExists(user: string, host: string) {
  var result = await sqlCharonSetup.sql.query("SELECT User,Host FROM mysql.user where User = ? AND Host = ?", { replacements: [user, host], type: Sequelize.QueryTypes.SELECT });
  if (result.length > 0) {
    return sqlCharonSetup.sql.query(getDropUserQuery(user, host), { type: Sequelize.QueryTypes.RAW });
  }
  return result;
}

const dbUsername: string = 'charon';
const dbHost: string = 'localhost';

async function configureDbUser() {

  var dbPassword: string = await SecretUtils.createBase62Password(16);

  var dbConfig: DbConfig = {
    user: dbUsername,
    password: dbPassword,
    host: dbHost
  }
  fsExtra.writeJsonSync(ConfigConstants.DbConfig, dbConfig);

  await dropUserIfExists(dbUsername, dbHost);
  await sqlCharonSetup.sql.query(getCreateUserQuery(dbUsername, dbHost, dbPassword), { type: Sequelize.QueryTypes.RAW });
  await sqlCharonSetup.sql.query(getGrantUserQuery(dbUsername, dbHost), { type: Sequelize.QueryTypes.RAW });
}

configure();
