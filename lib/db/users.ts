///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal, DataAccessCommon} from './common'

export module Columns {
  export const ID: string = 'id';
  export const UID: string = 'uid';
  export const USERNAME: string = 'username';
  export const EMAIL: string = 'email';
}

export interface UserContext {
  email: string;
  username: string;
}

export interface UserInternal extends CommonDataInternal, UserContext {
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInstance extends Sequelize.Instance<UserInstance, UserInternal>, UserInternal { }

export type UserModel = Sequelize.Model<UserInstance, UserInternal>;

export class DataAccessUser extends DataAccessCommon<UserModel> {

  protected createModelAttributes(): Sequelize.DefineAttributes {
    var attributes: Sequelize.DefineAttributes = super.createModelAttributes();
    attributes[Columns.USERNAME] = {
      type: Sequelize.STRING(64),
      unique: true,
      allowNull: false
    };
    attributes[Columns.EMAIL] = {
      type: Sequelize.STRING(256),
      allowNull: false
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
