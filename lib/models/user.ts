///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Q from 'q';
var _Q = require('q');

import {UserModel} from '../db/index';
import {ModelInstance, CollectionQueryResult} from './common';

import {UserInternal, UserInstance, UserContext} from '../db/users';

export enum UserState {
  Active,
  Deleted
};

export class User extends ModelInstance<UserInstance> {
  get username(): string {
    return this.instance.username;
  }

  get email(): string {
    return this.instance.email;
  }

  get createdAt(): Date {
    return this.instance.createdAt;
  }

  get updatedAt(): Date {
    return this.instance.updatedAt;
  }

  delete(): Q.Promise<void> {
    return _Q(this.instance.destroy());
  }

  // static methods
  static create(userContext: UserContext): Q.Promise<User> {
    return _Q(UserModel.create(<UserInternal>userContext))
      .then((instance: UserInstance): User=> {
      return new User(instance);
    });
  }

  static async findById(id: string): Promise<User> {
    var instance: UserInstance = await UserModel.findOne({ where: { uid: id } });
    if (instance) {
      return new User(instance);
    }
    return null;
  }

  static findAndCountAllActive(opt: {
    limit: number
  }): Q.Promise<CollectionQueryResult<User, number>> {
    return _Q(UserModel.findAndCountAll({
      limit: opt.limit
    }))
      .then((result: { rows: UserInstance[], count: number }): CollectionQueryResult<User, number> => {
      var items: User[] = [];
      result.rows.forEach((instance: UserInstance) => {
        items.push(new User(instance));
      });
      return {
        count: result.count,
        items: items
      };
    })
  }
}
