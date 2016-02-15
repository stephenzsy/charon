///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal, DataAccessCommon} from './common'
import {UserModel, UserInternal, UserInstance, Columns as UserColumns} from './users'

export module Columns {
  export const USER_ID: string = 'userId';
  export const NETWORK_ID: string = 'networkId';
  export const PASSWORD: string = 'password';
  export const VALID_TO: string = 'validTo';
  export const ACTIVE: string = 'active';
}

export interface PasswordInternal extends CommonDataInternal {
  user: UserInternal;
  networkId: string;
  password: string;
  validTo: Date;
  active: boolean;
}

export interface PasswordInstance extends Sequelize.Instance<PasswordInstance, PasswordInternal>, PasswordInternal {
  getUser(): Promise<UserInstance>;
  setUser(user: UserInstance): Promise<PasswordInstance>;
}

export type PasswordModel = Sequelize.Model<PasswordInstance, PasswordInternal>
export class DataAccessPassword extends DataAccessCommon<PasswordModel> {

  private userModel: UserModel;

  constructor(
    sqlize: Sequelize.Sequelize,
    userModel: UserModel) {
    super(sqlize);
    this.userModel = userModel;
  }

  protected createModelAttributes(): Sequelize.DefineAttributes {
    var attributes: Sequelize.DefineAttributes = super.createModelAttributes();
    attributes[Columns.NETWORK_ID] = {
      type: Sequelize.UUID,
      allowNull: false
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
    return attributes;
  }

  protected createModel(): PasswordModel {
    var model: PasswordModel = <PasswordModel>this.sqlize.define(
      'password',
      this.createModelAttributes(), {
        timestamps: false,
        indexes: [
          {
            unique: true,
            fields: [Columns.USER_ID, Columns.NETWORK_ID]
          }
        ]
      });

    model.belongsTo(this.userModel, { foreignKey: Columns.USER_ID, as: 'user' });
    return model;
  }
}
