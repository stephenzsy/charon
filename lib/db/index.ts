/// <reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';
var _Sequelize = require('sequelize');

import * as UserModels from './users';
import * as NetworkModels from './networks';
import * as PasswordModels from './passwds';

const charonSequelize: Sequelize.Sequelize = new _Sequelize('charon', 'root');

export const UserModel: UserModels.UserModel = new UserModels.DataAccessUser(charonSequelize).model;
export const NetworkModel: NetworkModels.NetworkModel = new NetworkModels.DataAccessNetwork(charonSequelize).model;
export const PasswordModel: PasswordModels.PasswordModel = new PasswordModels.DataAccessPassword(charonSequelize, UserModel, NetworkModel).model;
