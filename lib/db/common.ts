import * as Sequelize from 'sequelize';

export module Columns {
  export const ID: string = 'id';
  export const UID: string = 'uid';
}

export interface CommonDataInternal {
  id: number;
  uid: string;
}

export abstract class DataAccessCommon<T extends Sequelize.Model<any, any>> {
  protected sqlize: Sequelize.Sequelize;
  private _model: T = null;

  constructor(sqlize: Sequelize.Sequelize) {
    this.sqlize = sqlize;
  }

  protected  createModelAttributes(): Sequelize.DefineAttributes {
    var attributes: Sequelize.DefineAttributes = {};
    attributes[Columns.ID] = {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    };
    attributes[Columns.UID] = {
      type: Sequelize.UUID,
      unique: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4
    };
    return attributes;
  }

  protected abstract createModel(): T;

  get model(): T {
    if (this._model) {
      return this._model;
    }
    this._model = this.createModel();
    return this._model;
  }
}
