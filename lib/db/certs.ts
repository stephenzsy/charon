///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal, DataAccessCommon} from './common'
import {UserModel, UserInternal, UserInstance, Columns as UserColumns} from './users'

export module Columns {
  export const TYPE: string = 'type';
  export const SUBJECT: string = 'subject';
  export const USER_ID: string = 'userId';
  export const NETWORK_ID: string = 'networkId';
}

export module CertTypeStr {
  export const CA: string = 'CA';
  export const Server: string = 'SERVER';
  export const Client: string = 'Client';
}

export interface CertInternal extends CommonDataInternal {
  type: string;
  subject: string;
  user: UserInternal;
  networkId: string;
}

export interface CertInstance extends Sequelize.Instance<CertInstance, CertInternal>, CertInternal { }

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
      type: Sequelize.ENUM([CertTypeStr.CA, CertTypeStr.Server, CertTypeStr.Client]),
      allowNull: false
    };
    attributes[Columns.SUBJECT] = {
      type: Sequelize.STRING(1024),
      allowNull: false
    };
    attributes[Columns.NETWORK_ID] = {
      type: Sequelize.UUID,
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
            fields: [Columns.USER_ID, Columns.NETWORK_ID]
          }
        ]
      });

    model.belongsTo(this.userModel, { foreignKey: Columns.USER_ID, as: 'user' });
    return model;
  }
}
