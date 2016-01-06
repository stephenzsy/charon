///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Q from 'q';
var _Q = require('q');

import {UserModel} from '../db/index';
import {CollectionResult} from '../../models/common';

import {User as IUser, UserContext} from '../../models/users';
import {UserInternal} from '../db//users';

export class User {
  private static internalToExternal(userInternal: UserInternal): IUser {
    return {
      id: userInternal.uid,
      name: userInternal.name,
      email: userInternal.email,
      createdAt: userInternal.createdAt
    };
  }

  static create(userContext: UserContext): Q.Promise<IUser> {
    return _Q(UserModel.create({
      name: userContext.name,
      email: userContext.email
    }))
      .then(User.internalToExternal);
  }

  static findAndCountAll(opt: {
    limit: number
  }): Q.Promise<CollectionResult<IUser, number>> {
    return _Q(UserModel.findAndCountAll({
      limit: opt.limit
    }))
      .then((result: { rows: UserInternal[], count: number }): CollectionResult<IUser, number> => {
      var items: IUser[] = [];
      result.rows.forEach((userInternal: UserInternal) => {
        items.push(User.internalToExternal(userInternal));
      });
      return {
        count: result.count,
        items: items
      };
    })
  }
}
