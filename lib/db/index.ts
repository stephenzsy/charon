///<reference path="./init.d.ts"/>

import * as Sequelize from 'sequelize';

import * as UserModels from './users';
import {User} from '../models/contracts/users';
import * as dbInit from './init';

export const UserModel: Sequelize.Model<UserModels.UserInstance, User> = new UserModels.DataAccessUser(dbInit.charonSequelize).model;
