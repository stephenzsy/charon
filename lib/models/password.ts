///<reference path="../../typings/moment/moment-node.d.ts"/>

import * as Q from 'q';
import * as moment from 'moment';
const _Q = require('q');
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

  static create(user: User): Q.Promise<Password> {
    if (!user) {
      return Q.reject<Password>('Null user provided to create password');
    }
    return createBase62Password(16)
      .then((password: string) => {
      var validTo = _moment().add(30, 'd');
      return PasswordModel.create(<PasswordInternal>{
        password: password,
        validTo: validTo.toDate()
      })
        .then((instance: PasswordInstance): Q.Promise<PasswordInstance> => {
        return _Q(instance.setUser(user.instance));
      }).then((instance: PasswordInstance): Password => {
        return new Password(instance);
      });
    });
  }
}
