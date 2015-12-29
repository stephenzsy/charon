///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import {UserModel} from '../db/index';
import {User} from './contracts/users';

export class Users {
  static create(userContext: User): Q.Promise<User> {
    return Q(UserModel.create(userContext));
  }
}
