///<reference path="../../typings/moment/moment-node.d.ts"/>

import * as sequelize from 'sequelize';
import * as moment from 'moment';
const _moment: moment.MomentStatic = require('moment');

import {UserModel, PasswordModel} from '../db/index';
import {Columns as CommonColumns} from '../db/common';
import {PasswordInternal, PasswordInstance, Columns as PasswordColumns} from '../db/passwds';
import {ModelInstance} from './common';
import {User} from './users';
import {Network} from './networks';

import {createBase62Password} from '../secrets/utils'

export class Password extends ModelInstance<PasswordInstance> {
  get password(): string {
    return this.instance.password;
  }

  get validTo(): Date {
    return this.instance.validTo;
  }

  get networkId(): string {
    return this.instance.networkId;
  }

  delete(): Promise<void> {
    return this.instance.destroy();
  }

  static async deleteById(id: string): Promise<number> {
    var whereClause: sequelize.WhereOptions = {}
    whereClause[CommonColumns.UID] = id;
    return await PasswordModel.destroy({ where: whereClause });
  }

  static async find(user: User, network: Network): Promise<Password[]> {
    if (!user) {
      return new Promise<Password[]>(reject => 'Null user provided to create password');
    }
    var whereClause: sequelize.WhereOptions = {
      userId: user.instance.id
    };
    if (network) {
      whereClause[PasswordColumns.NETWORK_ID] = network.id;
    }
    var instances: PasswordInstance[] = await PasswordModel.findAll({
      where: whereClause
    });
    return instances.map((instance: PasswordInstance): Password => new Password(instance));
  }

  static async create(user: User, network: Network): Promise<Password> {
    if (!user) {
      return new Promise<Password>(reject => 'Null user provided to create password');
    }
    if (!network) {
      return new Promise<Password>(reject => 'Null network provided to create password');
    }
    var password: string = await createBase62Password(16);
    var validTo: moment.Moment = _moment().add(30, 'd');
    var instance: PasswordInstance = await PasswordModel.create(<PasswordInternal>{
      password: password,
      validTo: validTo.toDate(),
      networkId: network.id
    });
    instance = await instance.setUser(user.instance);
    return new Password(instance);
  }

}