///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Q from 'q';
var _Q = require('q');

import {UserModel} from '../db/index';
import {User as IUser, UserContext} from '../../models/users';
import {UserInternal} from '../db//users';

export class User {
  static create(userContext: UserContext): Q.Promise<IUser> {
    return _Q(UserModel.create({
      name: userContext.name,
      email: userContext.email
    }))
      .then((userInternal: UserInternal): IUser => {
      return {
        id: userInternal.uid,
        name: userInternal.name,
        email: userInternal.email,
        createdAt: userInternal.createdAt
      };
    });
  }

  static findAndCountAll(opt: {
    limit: number
  }): Q.Promise<User[]> {
    return _Q(UserModel.findAndCountAll({
      limit: opt.limit
    })).then((result: { rows: UserInternal[], count: number }) => {
    })
  }
}
