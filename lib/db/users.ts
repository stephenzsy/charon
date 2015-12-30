///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';
import {User} from '../models/contracts/users';

export interface UserInstance extends Sequelize.Instance<UserInstance, User>, User { }

export class DataAccessUser {
  private _model: Sequelize.Model<UserInstance, User>;

  constructor(sqlize: Sequelize.Sequelize) {
    this._model = <Sequelize.Model<UserInstance, User>>sqlize.define('user', {
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

  get model(): Sequelize.Model<UserInstance, User> {
    return this._model;
  }
}
