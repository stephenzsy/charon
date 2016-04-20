///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import * as db from 'charon/lib/db/index';

export async function configure() {
  try {
    await db.UserModel.sync();
    await db.PasswordModel.sync();
    await db.CertModel.sync();
    await db.PermissionModel.sync();
    db.charonSequelize.close();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

configure();
