///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Q from 'q';
var _Q = require('q');

import {UserModel} from '../db/index';
import {User as IUser, UserContext as IUserContext} from './contracts/users';

export class User {
  static create(userContext: IUserContext): Q.Promise<IUser> {
    return _Q(UserModel.create(<IUser>userContext));
  }
}
