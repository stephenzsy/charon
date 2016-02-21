///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal, DataAccessCommon} from './common'
import {CertInstance} from './certs';

export module Columns {
  export const Username: string = 'username';
  export const Email: string = 'email';
  export const Type: string = 'type';
}

export module UserTypeStr {
  export const Unknown: string = 'UNKNOWN';
  export const System: string = 'SYSTEM';
  export const Login: string = 'LOGIN';
  export const Network: string = 'NETWORK';
}

export interface UserInternal extends CommonDataInternal {
  username: string;
  type: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInstance extends Sequelize.Instance<UserInstance, UserInternal>, UserInternal {
  getCerts(options: {
    where: {
      type: string;
      networkId?: string;
    }
  }): Promise<CertInstance[]>
}

export type UserModel = Sequelize.Model<UserInstance, UserInternal>;

export class DataAccessUser extends DataAccessCommon<UserModel> {

  protected createModelAttributes(): Sequelize.DefineAttributes {
    var attributes: Sequelize.DefineAttributes = super.createModelAttributes();
    attributes[Columns.Username] = {
      type: Sequelize.STRING(64),
      unique: true,
      allowNull: false
    };
    attributes[Columns.Email] = {
      type: Sequelize.STRING(256),
      allowNull: false
    };
    attributes[Columns.Type] = {
      type: Sequelize.ENUM([
        UserTypeStr.System,
        UserTypeStr.Login,
        UserTypeStr.Network
      ])
    };
    return attributes;
  }

  protected createModel(): UserModel {
    var model: UserModel = <UserModel>this.sqlize.define(
      'user',
      this.createModelAttributes(), {});

    return model;
  }
}
