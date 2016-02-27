///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import * as Q from 'q';
import * as mysql from 'mysql';
import Constants from '../lib/constants';
import * as db from '../lib/db/index';
import {UserInternal, UserInstance} from '../lib/db/users';
import {CertInternal, CertInstance} from '../lib/db/certs';

async function configure() {
  try {
    await db.charonSequelize.drop();
    await db.UserModel.sync();
    await db.PasswordModel.sync();
    await db.CertModel.sync();
    await db.PermissionModel.sync();
    db.charonSequelize.close();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

configure();
