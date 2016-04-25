///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import {sqlCharonSetup} from './init';

async function configure() {
  try {
    await sqlCharonSetup.sql.drop();
    sqlCharonSetup.sql.close();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

configure();
