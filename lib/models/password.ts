///<reference path="../../typings/moment/moment-node.d.ts"/>

import * as moment from 'moment';
const _moment: moment.MomentStatic = require('moment');

import {UserModel, PasswordModel} from '../db/index';
import {PasswordInternal, PasswordInstance} from '../db/passwds';
import {ModelInstance} from './common';
import {User} from './user';
import {createBase62Password} from '../secrets/utils'

export class Password extends ModelInstance<PasswordInstance> {
  get password(): string {
    return this.instance.password;
  }

  get validTo(): Date {
    return this.instance.validTo;
  }

  static async create(user: User, networkId: string): Promise<Password> {
    if (!user) {
      return new Promise<Password>(reject => 'Null user provided to create password');
    }
    var password: string = await createBase62Password(16);
    var validTo: moment.Moment = _moment().add(30, 'd');
    var instance: PasswordInstance = await PasswordModel.create(<PasswordInternal>{
      password: password,
      validTo: validTo.toDate(),
      networkId: networkId
    });
    await instance.setUser(user.instance);
    return new Password(instance);
  }
}
