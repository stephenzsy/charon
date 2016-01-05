///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

export interface UserInternal {
  id?: number;
  uid?: string;
  email?: string;
  name?: string;
  createdAt?: Date;
}

export interface UserInstance extends Sequelize.Instance<UserInstance, UserInternal>, UserInternal { }

export class DataAccessUser {
  private _model: Sequelize.Model<UserInstance, UserInternal>;

  constructor(sqlize: Sequelize.Sequelize) {
    this._model = <Sequelize.Model<UserInstance, UserInternal>>sqlize.define('user', {
      'id': <Sequelize.DefineAttributeColumnOptions>{
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      'uid': {
        type: Sequelize.UUID,
        unique: true,
        allowNull: false,
        defaultValue: Sequelize.UUIDV4
      },
      'email': {
        type: Sequelize.STRING(256),
        unique: true,
        allowNull: false
      },
      'name': {
        type: Sequelize.STRING(256),
        allowNull: false
      }
    }, {
      });
  }

  get model(): Sequelize.Model<UserInstance, UserInternal> {
    return this._model;
  }
}
