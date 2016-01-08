///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

export module Columns {
  export const ID: string = 'id';
  export const UID: string = 'uid';
  export const USERNAME: string = 'username';
  export const EMAIL: string = 'email';
  export const STATE: string = 'state';
}

export module UserState {
  export const Active: string = 'ACTIVE';
  export const Deleted: string = 'DELETED';
}

export interface UserInternal {
  id?: number;
  uid?: string;
  email?: string;
  username?: string;
  createdAt?: Date;
  updatedAt?: Date;
  state?: string;
}

export interface UserInstance extends Sequelize.Instance<UserInstance, UserInternal>, UserInternal { }

export class DataAccessUser {
  private _model: Sequelize.Model<UserInstance, UserInternal>;

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
      allowNull: false
    };
    attributes[Columns.EMAIL] = {
      type: Sequelize.STRING(256),
      allowNull: false
    };
    attributes[Columns.STATE] = {
      type: Sequelize.ENUM,
      values: [UserState.Active, UserState.Deleted],
      defaultValue: UserState.Active,
      allowNull: false
    };
    this._model = <Sequelize.Model<UserInstance, UserInternal>>sqlize.define('user', attributes, {});
  }

  get model(): Sequelize.Model<UserInstance, UserInternal> {
    return this._model;
  }
}
