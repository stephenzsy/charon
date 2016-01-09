///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';
import {UserInstance, UserInternal, Columns as UserColumns} from './users'

export module Columns {
  export const ID: string = 'id';
  export const UID: string = 'uid';
  export const USER_ID: string = 'userId';
  export const PASSWORD: string = 'password';
  export const VALID_TO: string = 'validTo';
  export const ACTIVE: string = 'active';
}

export interface PasswordContext {
  user: UserInternal;
  password: string;
  validTo: Date;
}

export interface PasswordInternal extends PasswordContext {
  id?: number;
  uid?: string;
  active?: boolean;
}

export interface PasswordInstance extends Sequelize.Instance<PasswordInstance, PasswordInternal>, PasswordInternal {
  setUser(user: UserInstance): Promise<PasswordInstance>
}

export class DataAccessPassword {
  private _model: Sequelize.Model<PasswordInstance, PasswordInternal>;

  constructor(sqlize: Sequelize.Sequelize, userModel: Sequelize.Model<UserInstance, UserInternal>) {
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
    attributes[Columns.PASSWORD] = {
      type: Sequelize.STRING(128),
      allowNull: false
    };
    attributes[Columns.VALID_TO] = {
      type: Sequelize.DATE,
      allowNull: false
    };
    attributes[Columns.ACTIVE] = {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    };
    this._model = <Sequelize.Model<PasswordInstance, PasswordInternal>>sqlize.define('password', attributes, {
      timestamps: false
    });

    this._model.belongsTo(userModel, { foreignKey: Columns.USER_ID, as: 'user' });
  }

  get model(): Sequelize.Model<PasswordInstance, PasswordInternal> {
    return this._model;
  }
}
