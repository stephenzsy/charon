///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

import {DataAccess} from './common';

/*
#
# Table structure for table 'radcheck'
#

CREATE TABLE radcheck (
  id int(11) unsigned NOT NULL auto_increment,
  username varchar(64) NOT NULL default '',
  attribute varchar(64)  NOT NULL default '',
  op char(2) NOT NULL DEFAULT '==',
  value varchar(253) NOT NULL default '',
  PRIMARY KEY  (id),
  KEY username (username(32))
);
*/

export module Columns {
  export const ID: string = 'id';
  export const USERNAME: string = 'username';
  export const ATTRIBUTE: string = 'attribute';
  export const OP: string = 'op';
  export const VALUE: string = 'value';
}

export interface RadcheckInternal {
  id?: number;
  username: string;
  attribute: string;
  op: string;
  value: string;
}

export interface RadcheckInstance extends Sequelize.Instance<RadcheckInstance, RadcheckInternal>, RadcheckInternal {
}

export type RadcheckModel = Sequelize.Model<RadcheckInstance, RadcheckInternal>

export class DataAccessRadcheck implements DataAccess<RadcheckModel> {
  protected sqlize: Sequelize.Sequelize;
  private tableName: string;

  constructor(sqlize: Sequelize.Sequelize, tableName: string) {
    this.sqlize = sqlize;
    this.tableName = tableName;
  }

  protected createModelAttributes(): Sequelize.DefineAttributes {
    var attributes: Sequelize.DefineAttributes = {};
    attributes[Columns.ID] = {
      type: Sequelize.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    };
    attributes[Columns.USERNAME] = {
      type: Sequelize.STRING(64),
      allowNull: false
    };
    attributes[Columns.ATTRIBUTE] = {
      type: Sequelize.STRING(64),
      allowNull: false
    };
    attributes[Columns.OP] = {
      type: Sequelize.CHAR(2),
      allowNull: false
    };
    attributes[Columns.VALUE] = {
      type: Sequelize.STRING(253),
      allowNull: false
    };
    return attributes;
  }

  get model(): RadcheckModel {
    var model: RadcheckModel = <RadcheckModel>this.sqlize.define(
      this.tableName,
      this.createModelAttributes(), {
        timestamps: false,
        freezeTableName: true,
        indexes: [
          <Sequelize.DefineIndexesOptions>{
            name: Columns.USERNAME,
            fields: [{ attribute: Columns.USERNAME, collate: null, order: null, length: 32 }]
          }
        ]
      });
    return model;
  }
}
