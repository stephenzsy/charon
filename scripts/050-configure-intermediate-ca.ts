///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import 'babel-polyfill';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';

import {CertSubjectConfig, CaCertSubjectConfig, InitCertsConfig} from '../models/init';
import {CertSubject, CertType} from '../lib/models/certs';
import {createPrivateKey} from '../lib/certs/utils';
import {sqlCharon} from '../lib/db/index';
import {CertsManager, RootCaCertsManager, SiteCertsManager} from '../lib/certs/certs-managers';
import User, * as Users from '../lib/models/users';
import AppConfig, {Constants as ConfigConstants} from '../lib/config/config';
import {SystemUsers, getSystemUsers} from '../scripts/utils';
const initCertsConfig: InitCertsConfig = require(path.join(ConfigConstants.ConfigInitDir, 'certs-config.json'));

async function configureIntermediateCa(user: User, certSubject: CertSubject, rootCaManager: RootCaCertsManager) {
  await rootCaManager.createIntermediateCa(user, null, certSubject.subject);
}

async function configure() {
  try {
    var systemUsers: SystemUsers = await getSystemUsers();
    var rootCaManager = await RootCaCertsManager.getInstance(systemUsers.root);

    // site ca
    void systemUsers.site.deleteCerts(CertType.CA, null);
    var siteCaSubject: CertSubject = new CertSubject(initCertsConfig.ca, initCertsConfig.siteCa);
    await configureIntermediateCa(systemUsers.site, siteCaSubject, rootCaManager);
    // proxy ca
    void systemUsers.proxy.deleteCerts(CertType.CA, null);
    var proxyCaSubject: CertSubject = new CertSubject(initCertsConfig.ca, initCertsConfig.proxyCa);
    await configureIntermediateCa(systemUsers.proxy, proxyCaSubject, rootCaManager);

    sqlCharon.sql.close();
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
