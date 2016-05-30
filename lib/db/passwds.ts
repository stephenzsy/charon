///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal, DataAccessCommon} from './common'
import {UserModel, UserInternal, UserInstance, Columns as UserColumns} from './users'

export module Columns {
  export const UserId: string = 'userId';
  export const NetworkId: string = 'networkId';
  export const Password: string = 'password';
  export const ValidTo: string = 'validTo';
  export const Active: string = 'active';
  export const PasswordRadcheckId: string = 'radcheckId';
}

export interface PasswordInternal extends CommonDataInternal {
  networkId: string;
  password: string;
  validTo: Date;
  active: boolean;
  radcheckId?: number;
  userId: number;
}

export interface PasswordInstance extends Sequelize.Instance<PasswordInternal>, PasswordInternal {
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
    attributes[Columns.NetworkId] = {
      type: Sequelize.UUID,
      allowNull: false
    };
    attributes[Columns.Password] = {
      type: Sequelize.STRING(128),
      allowNull: false
    };
    attributes[Columns.ValidTo] = {
      type: Sequelize.DATE,
      allowNull: false
    };
    attributes[Columns.Active] = {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    };
    attributes[Columns.PasswordRadcheckId] = {
      type: Sequelize.INTEGER(11).UNSIGNED,
      allowNull: true
    }
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
            fields: [Columns.UserId, Columns.NetworkId]
          },
          {
            unique: true,
            fields: [Columns.NetworkId, Columns.PasswordRadcheckId]
          }
        ]
      });

    model.belongsTo(this.userModel, {
      foreignKey: {
        allowNull: false,
        name: Columns.UserId
      }, as: 'user'
    });
    return model;
  }
}
