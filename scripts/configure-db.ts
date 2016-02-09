///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import * as Shared from './shared';

import * as Q from 'q';
import * as mysql from 'mysql';
import Constants from '../lib/constants';
import * as db from '../lib/db/index';
import {UserInternal, UserInstance} from '../lib/db/users';
import {CertInternal, CertInstance, CertTypeStr, CertStateStr} from '../lib/db/certs';
import {caCertBundle} from '../lib/certs/ca';

const charonDBName: string = 'charon';
const certsDBTableName: string = 'certs';

async function createCACert(): Promise<CertInstance> {
  return db.CertModel.create(<CertInternal>{
    type: CertTypeStr.CA,
    subject: caCertBundle.certificateSubject,
    state: CertStateStr.Active,
    networkId: Constants.UUID0
  });
}

async function configure() {
  try {
    await db.charonSequelize.drop();
    await db.UserModel.sync();
    await db.PasswordModel.sync();
    await db.CertModel.sync();
    await createCACert();
    db.charonSequelize.close();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

configure();
