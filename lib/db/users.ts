///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as sequelize from 'sequelize';
import {User} from '../models/contracts/users';

export interface UserInstance extends sequelize.Instance<UserInstance, User>, User { }

export class DataAccessUser {
  private _model: sequelize.Model<UserInstance, User>;

  constructor(sqlize: sequelize.Sequelize) {
    this._model = <sequelize.Model<UserInstance, User>>sqlize.define('user', {
      'id': <sequelize.DefineAttributeColumnOptions>{
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        get: function(): string {
          var _this: UserInstance = this;
          return _this.getDataValue('uid');
        },
        set: function(val: string) {
          var _this: UserInstance = this;
          return _this.setDataValue('uid', val);
        }
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
      });
  }

  get model(): sequelize.Model<UserInstance, User> {
    return this._model;
  }
}
