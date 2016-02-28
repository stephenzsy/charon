///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import {configure as base} from './configure-db';
import * as db from '../lib/db/index';

async function configure() {
  try {
    await db.charonSequelize.drop();
  } catch (e) {
    console.error(e);
    throw e;
  }
  return base();

}

configure();
