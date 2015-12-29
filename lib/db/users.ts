///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as sequelize from 'sequelize';
import {User} from '../models/users';

interface UserInstance extends sequelize.Instance<UserInstance, User>, User { }

export class DataAccessUser {
  private _model: sequelize.Model<UserInstance, User>;

  constructor(sqlize: sequelize.Sequelize) {
    this._model = <sequelize.Model<UserInstance, User>>sqlize.define('users', {
      'id': <sequelize.DefineAttributeColumnOptions>{
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      'uid': {
        type: sequelize.UUID,
        unique: true,
        allowNull: false
      },
      'email': {
        type: sequelize.STRING(256),
        unique: true,
        allowNull: false
      },
      'name': {
        type: sequelize.STRING(256),
        allowNull: false
      }
    }, {
        freezeTableName: true
      });
  }

  get model(): sequelize.Model<UserInstance, User> {
    return this._model;
  }
}
