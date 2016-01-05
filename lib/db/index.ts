/// <reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';
var _Sequelize = require('sequelize');

import * as UserModels from './users';

const charonSequelize: Sequelize.Sequelize = new _Sequelize('charon', 'root');

export const UserModel: Sequelize.Model<UserModels.UserInstance, UserModels.UserInternal> = new UserModels.DataAccessUser(charonSequelize).model;
