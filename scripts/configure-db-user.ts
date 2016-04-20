///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import 'babel-polyfill';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as Sequelize from 'sequelize';
const _Sequelize = require('sequelize');

import * as fsExtra from 'fs-extra';

import {CertSubjectConfig, CaCertSubjectConfig, InitCertsConfig} from '../models/init';
import {CertSubject, CertType, CertFileBundle} from '../lib/models/certs';
import {createPrivateKey} from '../lib/certs/utils';
import {charonSequelize} from '../lib/db/index';
import {CertsManager, RootCaCertsManager, SiteCertsManager} from '../lib/certs/certs-managers';
import User, * as Users from '../lib/models/users';
import AppConfig, {Constants as ConfigConstants, DbConfig} from '../lib/config/config';
import SecretUtils from 'charon/lib/secrets/utils';
const initCertsConfig: InitCertsConfig = require(path.join(ConfigConstants.ConfigInitDir, 'certs-config.json'));

function getCreateUserQuery(user: string, host: string, password: string): string {
  return "CREATE USER '" + user + "'@'" + host + "'"
    + " IDENTIFIED BY '" + password + "'";
}

function getDropUserQuery(user: string, host: string): string {
  return "DROP USER '" + user + "'@'" + host + "'";
}

async function dropUserIfExists(user: string, host: string) {
  var result = await charonSequelize.query("SELECT User,Host FROM mysql.user where User = ? AND Host = ?", { replacements: [user, host], type: Sequelize.QueryTypes.SELECT });
  if (result.length > 0) {
    return charonSequelize.query(getDropUserQuery(user, host), { type: Sequelize.QueryTypes.RAW });
  }
  return result;
}

const dbUsername: string = 'charon';
const dbHost: string = '::1';

async function configure() {
  try {
    var dbPassword: string = await SecretUtils.createBase62Password(16);

    var rootUser: User = await User.findByUsername('root', Users.UserType.System);
    var rootCaManager = await RootCaCertsManager.getInstance(rootUser);

    var dbUser: User = await User.findByUsername('db', Users.UserType.System);
    if (dbUser) {
      await dbUser.delete(true);
    }
    dbUser = await User.create(Users.UserType.System, 'db', 'db@system');
    var dbCaSubject: CertSubject = new CertSubject(initCertsConfig.ca, initCertsConfig.dbCa);
    await rootCaManager.createIntermediateCa(dbUser, null, dbCaSubject.subject);
    var dbSubject: CertSubject = new CertSubject(dbCaSubject, initCertsConfig.dbServer);
    var dbCertsManager: SiteCertsManager = await SiteCertsManager.getInstance(dbUser);
    await dbCertsManager.createSiteCert(dbSubject.subject, dbUser, 'db',
      undefined, undefined, false);
    var dbClientSubject: CertSubject = new CertSubject(dbCaSubject, initCertsConfig.dbClient);
    var subject: string = dbClientSubject.subject;
    var clientCertBundle: CertFileBundle = await dbCertsManager.createClientCert(subject, dbUser, CertType.Site, false);

    var dbConfig: DbConfig = {
      user: dbUsername,
      password: dbPassword,
      host: dbHost,
      ssl: {
        key: fs.readFileSync(clientCertBundle.privateKeyFile).toString(),
        cert: fs.readFileSync(clientCertBundle.certificateFile).toString(),
        ca: fs.readFileSync(clientCertBundle.certificateChainFile).toString()
      }
    }
    fsExtra.writeJsonSync(ConfigConstants.DbConfig, dbConfig);

    await dropUserIfExists(dbUsername, dbHost);
    var createUserResults = await charonSequelize.query(getCreateUserQuery(dbUsername, dbHost, dbPassword), { type: Sequelize.QueryTypes.RAW });
    console.log(createUserResults);
    charonSequelize.close();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

try {
  configure();
} catch (err) {
  console.error(err);
}
