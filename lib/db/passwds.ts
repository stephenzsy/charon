///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal, DataAccessCommon} from './common'
import {UserModel, UserInternal, UserInstance, Columns as UserColumns} from './users'
import {NetworkModel, NetworkInternal, NetworkInstance, Columns as NetworkColumns} from './networks'

export module Columns {
  export const USER_ID: string = 'userId';
  export const NETWORK_ID: string = 'networkId';
  export const PASSWORD: string = 'password';
  export const VALID_TO: string = 'validTo';
  export const ACTIVE: string = 'active';
}

export interface PasswordInternal extends CommonDataInternal {
  user: UserInternal;
  network: NetworkInternal;
  password: string;
  validTo: Date;
}

export interface PasswordInstance extends Sequelize.Instance<PasswordInstance, PasswordInternal>, PasswordInternal {
  setUser(user: UserInstance): Promise<PasswordInstance>;
  setNetwork(user: NetworkInstance): Promise<PasswordInstance>;
}

export type PasswordModel = Sequelize.Model<PasswordInstance, PasswordInternal>
export class DataAccessPassword extends DataAccessCommon<PasswordModel> {

  private userModel: UserModel;
  private networkModel: NetworkModel;

  constructor(
    sqlize: Sequelize.Sequelize,
    userModel: UserModel,
    networkModel: NetworkModel) {
    super(sqlize);
    this.userModel = userModel;
    this.networkModel = networkModel;
  }

  protected createModelAttributes(): Sequelize.DefineAttributes {
    var attributes: Sequelize.DefineAttributes = super.createModelAttributes();
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
        timestamps: false
      });

    model.belongsTo(this.userModel, { foreignKey: Columns.USER_ID, as: 'user' });
    model.belongsTo(this.networkModel, { foreignKey: Columns.NETWORK_ID, as: 'network' });
    return model;
  }
}
