///<reference path="../../typings/moment/moment-node.d.ts"/>

import * as sequelize from 'sequelize';
import * as moment from 'moment';
const _moment: moment.MomentStatic = require('moment');

import {UserModel, PasswordModel, getRadcheckModel, sqlRadius} from '../db/index';
import {Columns as CommonColumns} from '../db/common';
import {PasswordInternal, PasswordInstance, Columns as PasswordColumns} from '../db/passwds';
import {UserInstance} from '../db/users';
import {RadcheckInternal} from '../db/radcheck';

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

  get network(): Network {
    return Network.findById(this.networkId);
  }

  delete(): Promise<void> {
    return this.instance.destroy();
  }

  async getUser(): Promise<User> {
    var userInstance: UserInstance = await this.instance.getUser();
    return new User(userInstance);
  }

  async activate(): Promise<boolean> {
    if (this.validTo <= new Date()) {
      return false;
    }
    var model = getRadcheckModel(sqlRadius, this.network.radcheckTableName);
    var user: User = await this.getUser();
    await model.destroy({
      where: {
        username: user.username
      }
    });
    var radcheck: RadcheckInternal = await model.create({
      username: user.username,
      attribute: 'Cleartext-Password',
      op: ':=',
      value: this.instance.password,
      passwordId: this.id
    });
    this.instance.active = true;
    this.instance.radcheckId = radcheck.id;
    await this.instance.save();
    return true;
  }

  async deactivate(): Promise<boolean> {
    var model = getRadcheckModel(sqlRadius, this.network.radcheckTableName);
    var user: User = await this.getUser();
    var numDeleted = await model.destroy({
      where: {
        username: user.username
      }
    });
    return numDeleted > 0;
  }

  static async findById(id: string): Promise<Password> {
    var whereClause: sequelize.WhereOptions = {}
    whereClause[CommonColumns.UID] = id;
    var instance = await PasswordModel.find({ where: whereClause });
    return new Password(instance);
  }

  static async find(user: User, network: Network): Promise<Password[]> {
    if (!user) {
      return new Promise<Password[]>(reject => 'Null user provided to create password');
    }
    var whereClause: sequelize.WhereOptions = {
      userId: user.instance.id
    };
    if (network) {
      whereClause[PasswordColumns.NetworkId] = network.id;
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
    var instance: PasswordInstance = await PasswordModel.create({
      password: password,
      validTo: validTo.toDate(),
      networkId: network.id,
      userId: user.instance.id,
      active: false
    });
    instance = await instance.setUser(user.instance);
    return new Password(instance);
  }

}
