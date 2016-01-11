///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal} from './common'

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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserInstance extends Sequelize.Instance<UserInstance, UserInternal>, UserInternal { }

export type UserModel = Sequelize.Model<UserInstance, UserInternal>;

export class DataAccessUser {
  private _model: UserModel;

  constructor(sqlize: Sequelize.Sequelize) {
    var attributes: Sequelize.DefineAttributes = {};
    attributes[Columns.ID] = {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    };
    attributes[Columns.UID] = {
      type: Sequelize.UUID,
      unique: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4
    };
    attributes[Columns.USERNAME] = {
      type: Sequelize.STRING(256),
      unique: true,
      allowNull: false
    };
    attributes[Columns.EMAIL] = {
      type: Sequelize.STRING(256),
      allowNull: false
    };
    this._model = <UserModel>sqlize.define('user', attributes, {});
  }

  get model(): UserModel {
    return this._model;
  }
}
