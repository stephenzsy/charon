///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as sequelize from 'sequelize';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
