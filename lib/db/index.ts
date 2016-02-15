/// <reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';
var _Sequelize = require('sequelize');

import * as UserModels from './users';
import * as PasswordModels from './passwds';
import * as CertModels from './certs';
import * as RadcheckModels from './radcheck';

export const charonSequelize: Sequelize.Sequelize = new _Sequelize('charon', 'root');

export const UserModel: UserModels.UserModel = new UserModels.DataAccessUser(charonSequelize).model;
export const PasswordModel: PasswordModels.PasswordModel = new PasswordModels.DataAccessPassword(charonSequelize, UserModel).model;
export const CertModel: CertModels.CertModel = new CertModels.DataAccessCert(charonSequelize, UserModel).model;

export const radiusSequelize: Sequelize.Sequelize = new _Sequelize('radius', 'root');
const radcheckModels: { [tableName: string]: RadcheckModels.RadcheckModel } = {};
export function getRadcheckModel(tableName: string) {
  var model: RadcheckModels.RadcheckModel = radcheckModels[tableName];
  if (!model) {
    model = radcheckModels[tableName] = new RadcheckModels.DataAccessRadcheck(radiusSequelize, tableName).model;
  }
  return model;
}
