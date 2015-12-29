/// <reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Sequelize from 'sequelize';

declare module init {
  const charonSequelize: Sequelize.Sequelize;
}

export = init;
