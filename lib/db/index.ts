/// <reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';
var _Sequelize = require('sequelize');

import * as UserModels from './users';
import * as PasswordModels from './passwds';
import * as CertModels from './certs';
import * as RadcheckModels from './radcheck';
import * as PermissionModels from './permissions';

import {SqlCharon, SqlRadius, configureSqlCharon, configureSqlRadius} from './schema';
import appConfig, {DbConfig} from '../config/config';

const dbConfig: DbConfig = appConfig.dbConfig;

export const sqlCharon: SqlCharon = configureSqlCharon(new _Sequelize('charon', dbConfig.user, dbConfig.password));

/**
 * @deprecated
 */
export const charonSequelize: Sequelize.Sequelize = sqlCharon.sql;

export const UserModel: UserModels.UserModel = sqlCharon.userModel;
export const PasswordModel: PasswordModels.PasswordModel = sqlCharon.passwordModel;
export const CertModel: CertModels.CertModel = sqlCharon.certModel;
export const PermissionModel: PermissionModels.PermissionModel = sqlCharon.permissionModel;

export const sqlRadius: SqlRadius = configureSqlRadius(new _Sequelize('radius', dbConfig.user, dbConfig.password));

const radcheckModels: { [tableName: string]: RadcheckModels.RadcheckModel } = {};
export function getRadcheckModel(sqlRadius: SqlRadius, tableName: string) {
  var model: RadcheckModels.RadcheckModel = radcheckModels[tableName];
  if (!model) {
    model = radcheckModels[tableName] = new RadcheckModels.DataAccessRadcheck(sqlRadius.sql, tableName).model;
  }
  return model;
}
