///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Q from 'q';
var _Q = require('q');

import Cert, {CertType, certTypeToStr} from "./certs";
import {UserModel, PermissionModel} from '../db/index';
import {CertTypeStr, CertInstance} from '../db/certs';
import {ModelInstance, CollectionQueryResult} from './common';
import {UserInternal, UserInstance, UserTypeStr} from '../db/users';
import {PermissionInstance} from '../db/permissions';
import Network from './networks';

export enum UserType {
  Login,
  Network,
  System
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

  get type(): UserType {
    return User.strToType(this.instance.type);
  }

  async getPermissionScopes(): Promise<string[]> {
    var permissions: PermissionInstance[] = await this.instance.getPermissions();
    return permissions.map(permission => {
      return permission.scope;
    });
  }

  async setPermissionScopes(scopes: string[]): Promise<void> {
    var permissions: PermissionInstance[] = await Promise.all(scopes.map(scope => {
      return PermissionModel.create({ scope: scope, userId: this.instance.id });
    }));
  }

  async getCaCertSerial(network: Network): Promise<number> {
    var whereClause = {
      type: CertTypeStr.CA
    };
    if (network) {
      whereClause['networkId'] = network.id;
    }
    var certs: CertInstance[] = await this.instance.getCerts({
      where: whereClause
    });
    if (certs.length != 1) {
      return null;
    }
    return certs[0].id;
  }

  async deleteCerts(certType: CertType, network: Network): Promise<number> {
    var whereClause = {
      type: certTypeToStr(certType)
    };
    if (network) {
      whereClause['networkId'] = network.id;
    }
    var certs: CertInstance[] = await this.instance.getCerts({
      where: whereClause
    });
    for (var i = 0; i < certs.length; ++i) {
      await certs[i].destroy();
    }
    return certs.length;
  }

  async delete(force: boolean = false): Promise<void> {
    if (this.type === UserType.System && !force) {
      throw "Deletion of system user is not allowed";
    }
    return this.instance.destroy();
  }

  // static methods
  static async create(type: UserType, username: string, email: string): Promise<User> {
    var instance: UserInstance = await UserModel.create(<UserInternal>{
      username: username,
      email: email,
      type: User.typeToStr(type)
    });
    return new User(instance);
  }

  static async findById(id: string): Promise<User> {
    var instance: UserInstance = await UserModel.findOne({ where: { uid: id } });
    if (instance) {
      return new User(instance);
    }
    return null;
  }

  static async findByUsername(name: string, type: UserType): Promise<User> {
    var instance: UserInstance = await UserModel.findOne({
      where: {
        username: name,
        type: User.typeToStr(type)
      }
    });
    if (instance) {
      return new User(instance);
    }
    return null;
  }

  static async findAndCountAllActive(type: UserType, limit: number): Promise<CollectionQueryResult<User, number>> {
    if (type === UserType.System) {
      throw "System users are not allowed to be listed";
    }
    var result = await UserModel.findAndCountAll({
      limit: limit,
      where: {
        type: User.typeToStr(type)
      }
    });
    var items: User[] = [];
    result.rows.forEach((instance: UserInstance) => {
      items.push(new User(instance));
    });
    return {
      count: result.count,
      items: items
    };
  }

  private static typeToStr(type: UserType): string {
    switch (type) {
      case UserType.Login:
        return UserTypeStr.Login;
      case UserType.Network:
        return UserTypeStr.Network;
      case UserType.System:
        return UserTypeStr.System;
    }
    return UserTypeStr.Unknown;
  }

  private static strToType(typeStr: string): UserType {
    switch (typeStr) {
      case UserTypeStr.Login:
        return UserType.Login;
      case UserTypeStr.Network:
        return UserType.Network;
      case UserTypeStr.System:
        return UserType.System;
    }
    return null;
  }
}

export default User;
