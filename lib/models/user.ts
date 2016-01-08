///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Q from 'q';
var _Q = require('q');

import {UserModel} from '../db/index';
import {ModelInstance, CollectionQueryResult} from './common';

import {UserContext} from '../../models/users';
import {UserInternal, UserState as UserStateValues, UserInstance} from '../db/users';
import {Password} from  './password'
export enum UserState {
  Active,
  Deleted
};

export class User extends ModelInstance<UserInstance> {
  get id(): string {
    return this.instance.uid;
  }

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

  delete(): Q.Promise<User> {
    this.instance.state = UserStateValues.Deleted;
    return _Q(this.instance.save()).then((instance: UserInstance) => {
      this.instance = instance;
      return this;
    });
  }

  createPassword(): Q.Promise<Password> {
    return null;
  }

  // static methods
  static create(userContext: UserContext): Q.Promise<User> {
    return _Q(UserModel.create({
      username: userContext.username,
      email: userContext.email
    })).then((instance: UserInstance): User=> {
      return new User(instance);
    });
  }

  static findById(id: string): Q.Promise<User> {
    return _Q(UserModel.findOne({ where: { uid: id } }))
      .then((instance: UserInstance): User=> {
      return new User(instance);
    })
  }

  static findAndCountAllActive(opt: {
    limit: number
  }): Q.Promise<CollectionQueryResult<User, number>> {
    return _Q(UserModel.findAndCountAll({
      where: { state: UserStateValues.Active },
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
