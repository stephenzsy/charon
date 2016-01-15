///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {CommonDataInternal, DataAccessCommon} from './common';

export module Columns {
  export const NAME: string = 'name';
  export const CLIENT_SECRET: string = 'clientSecret';
  export const DB_NAME: string = 'dbName';
}

export interface NetworkContext {
  name: string;
  dbName: string;
  clientSecret: string;
}

export interface NetworkInternal extends CommonDataInternal, NetworkContext {
}

export interface NetworkInstance extends Sequelize.Instance<NetworkInstance, NetworkInternal>, NetworkInternal { }

export type NetworkModel = Sequelize.Model<NetworkInstance, NetworkInternal>

export class DataAccessNetwork extends DataAccessCommon<NetworkModel> {

  protected createModelAttributes(): Sequelize.DefineAttributes {
    var attributes = super.createModelAttributes();
    attributes[Columns.NAME] = {
      type: Sequelize.STRING(256),
      allowNull: false,
      unique: true
    };
    attributes[Columns.CLIENT_SECRET] = {
      type: Sequelize.STRING(256),
      allowNull: false
    };
    attributes[Columns.DB_NAME] = {
      type: Sequelize.STRING(256),
      allowNull: false,
      unique: true
    };
    return attributes;
  }

  protected createModel(): NetworkModel {
    return <Sequelize.Model<NetworkInstance, NetworkInternal>>this.sqlize.define('network', this.createModelAttributes(), {
      timestamps: false
    });

  }
}