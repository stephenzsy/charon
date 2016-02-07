///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal, DataAccessCommon} from './common'
import {UserModel, UserInternal, UserInstance, Columns as UserColumns} from './users'

export module Columns {
  export const TYPE: string = 'type';
  export const STATE: string = 'state';
  export const NETWORK_ID: string = 'networkId';
  export const SUBJECT: string = 'subject';
  export const USER_ID: string = 'userId';
}

export module CertTypeStr {
  export const CA: string = 'CA';
  export const Site: string = 'SITE';
  export const Server: string = 'SERVER';
  export const Client: string = 'CLIENT';
}

export module CertStateStr {
  export const Pending: string = 'PENDING';
  export const Active: string = 'ACTIVE';
}

export interface CertInternal extends CommonDataInternal {
  type: string;
  state: string;
  networkId: string;
  subject: string;
  user: UserInternal;
}

export interface CertInstance extends Sequelize.Instance<CertInstance, CertInternal>, CertInternal {
  setUser(user: UserInstance): Promise<CertInstance>;
}

export type CertModel = Sequelize.Model<CertInstance, CertInternal>;

export class DataAccessCert extends DataAccessCommon<CertModel> {

  private userModel: UserModel;

  constructor(
    sqlize: Sequelize.Sequelize,
    userModel: UserModel) {
    super(sqlize);
    this.userModel = userModel;
  }

  protected createModelAttributes(): Sequelize.DefineAttributes {
    var attributes: Sequelize.DefineAttributes = {};
    attributes[Columns.TYPE] = {
      type: Sequelize.ENUM([
        CertTypeStr.CA,
        CertTypeStr.Site,
        CertTypeStr.Server,
        CertTypeStr.Client]),
      allowNull: false
    };
    attributes[Columns.STATE] = {
      type: Sequelize.ENUM([
        CertStateStr.Active,
        CertStateStr.Pending]),
      allowNull: false
    };
    attributes[Columns.NETWORK_ID] = {
      type: Sequelize.UUID,
      allowNull: false
    };
    attributes[Columns.SUBJECT] = {
      type: Sequelize.STRING(1024),
      allowNull: false
    };
    return attributes;
  }

  protected createModel(): CertModel {
    var model: CertModel = <CertModel>this.sqlize.define(
      'cert',
      this.createModelAttributes(), {
        timestamps: false,
        indexes: [
          {
            unique: true,
            fields: [Columns.TYPE, Columns.USER_ID, Columns.NETWORK_ID]
          }
        ]
      });

    model.belongsTo(this.userModel, { foreignKey: Columns.USER_ID, as: 'user' });
    return model;
  }
}
