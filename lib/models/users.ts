///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Q from 'q';
var _Q = require('q');

import {UserModel} from '../db/index';
import {CollectionResult} from '../../models/common';

import {User as IUser, UserContext, DeleteUserResult} from '../../models/users';
import {UserInternal, UserState, UserInstance} from '../db/users';

export class User {
  private static internalToExternal(userInternal: UserInternal): IUser {
    return {
      id: userInternal.uid,
      username: userInternal.username,
      email: userInternal.email,
      createdAt: userInternal.createdAt
    };
  }

  static create(userContext: UserContext): Q.Promise<IUser> {
    return _Q(UserModel.create({
      username: userContext.username,
      email: userContext.email
    }))
      .then(User.internalToExternal);
  }

  static findAndCountAllActive(opt: {
    limit: number
  }): Q.Promise<CollectionResult<IUser, number>> {
    return _Q(UserModel.findAndCountAll({
      where: { state: UserState.Active },
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

  static delete(id: string): Q.Promise<DeleteUserResult> {
    return _Q(UserModel.find({ where: { uid: id } }))
      .then((userInstance: UserInstance): Q.Promise<UserInstance> => {
      userInstance.state = UserState.Deleted;
      return _Q(userInstance.save());
    })
      .then((userInstance: UserInstance): DeleteUserResult => {
      return {
        deletedAt: userInstance.updatedAt
      }
    });
  }
}
