///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';
import {UserInstance, UserInternal, Columns as UserColumns} from './users'

export module Columns {
  export const ID: string = 'id';
  export const UID: string = 'uid';
  export const USER_ID: string = 'userId';
  export const USER_UID: string = 'userUid';
  export const PASSWORD: string = 'password';
  export const VALID_FROM: string = 'validFrom';
  export const VALID_TO: string = 'validTo';
  export const REVOKED: string = 'revoked';
}

export interface PasswordInternal {
  id?: number;
  uid?: string;
  userId?: number;
  userUid?: string;
  password?: string;
  validFrom?: Date;
  validTo?: Date;
  revoked?: boolean;
}

export interface PasswordInstance extends Sequelize.Instance<PasswordInstance, PasswordInternal>, PasswordInternal { }

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
    attributes[Columns.USER_ID] = {
      type: Sequelize.INTEGER,
      references: {
        model: userModel,
        key: UserColumns.ID
      },
      allowNull: false
    };
    attributes[Columns.USER_UID] = {
      type: Sequelize.UUID,
      references: {
        model: userModel,
        key: UserColumns.UID
      },
      allowNull: false
    };
    attributes[Columns.PASSWORD] = {
      type: Sequelize.STRING(128),
      allowNull: false
    };
    attributes[Columns.VALID_FROM] = {
      type: Sequelize.DATE,
      allowNull: false
    };
    attributes[Columns.VALID_TO] = {
      type: Sequelize.DATE,
      allowNull: false
    };
    attributes[Columns.REVOKED] = {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    };
    this._model = <Sequelize.Model<PasswordInstance, PasswordInternal>>sqlize.define('password', attributes, {
      timestamps: false
    });
  }

  get model(): Sequelize.Model<PasswordInstance, PasswordInternal> {
    return this._model;
  }
}
