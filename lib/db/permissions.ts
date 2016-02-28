///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal, DataAccessCommon} from './common';
import {UserModel} from './users';

export module Columns {
  export const UserId: string = 'userId';
  export const Scope: string = 'scope';
}

export interface PermissionInternal extends CommonDataInternal {
  scope: string;
}

export interface PermissionInstance extends Sequelize.Instance<PermissionInstance, PermissionInternal>, PermissionInternal { }

export type PermissionModel = Sequelize.Model<PermissionInstance, PermissionInternal>;

export class DataAccessPermission extends DataAccessCommon<PermissionModel> {

  private userModel: UserModel;

  constructor(sqlize: Sequelize.Sequelize, userModel: UserModel) {
    super(sqlize);
    this.userModel = userModel;
  }

  protected createModelAttributes(): Sequelize.DefineAttributes {
    var attributes: Sequelize.DefineAttributes = super.createModelAttributes();
    attributes[Columns.Scope] = {
      type: Sequelize.STRING(64),
      allowNull: false
    };
    return attributes;
  }

  protected createModel(): PermissionModel {
    var model: PermissionModel = <PermissionModel>this.sqlize.define(
      'permission',
      this.createModelAttributes(), {});
    model.belongsTo(this.userModel, {
      foreignKey: Columns.UserId, as: 'user', onDelete: 'CASCADE'
    });
    this.userModel.hasMany(model, { foreignKey: Columns.UserId, as: 'permissions' });
    return model;
  }
}
