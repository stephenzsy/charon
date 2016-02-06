///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import * as Shared from './shared';
import * as sequelize from 'sequelize';
const Sequelize = require('sequelize');

import * as Q from 'q';
import * as mysql from 'mysql';
import {DataAccessUser, UserInternal, UserInstance} from '../lib/db/users';
import {DataAccessPassword} from '../lib/db/passwds';
import {DataAccessCert, CertInternal, CertInstance, CertTypeStr} from '../lib/db/certs';
import {caCertBundle} from '../lib/certs/ca';

const charonDBName: string = 'charon';
const certsDBTableName: string = 'certs';

var charonSequelize: sequelize.Sequelize = new Sequelize('charon', 'root');
var userDataModel = new DataAccessUser(charonSequelize).model;
var passwordDataModel = new DataAccessPassword(charonSequelize, userDataModel).model;
var certDataModel = new DataAccessCert(charonSequelize, userDataModel).model;


async function createCACert(): Promise<CertInstance> {
  return certDataModel.create(<any>{
    type: CertTypeStr.CA,
    subject: caCertBundle.certificateSubject,
    networkId: '00000000-0000-0000-0000-000000000000'
  });
}

async function configure() {
  try {
    await charonSequelize.drop();
    await userDataModel.sync();
    await passwordDataModel.sync();
    await certDataModel.sync();
    await createCACert();
    charonSequelize.close();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

configure();
