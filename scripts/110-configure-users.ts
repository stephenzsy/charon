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
import {charonSequelize} from '../lib/db/index';
import {CertInternal, CertInstance} from '../lib/db/certs';
import {CertsManager, SiteCertsManager} from '../lib/certs/certs-managers';
import User, * as Users from '../lib/models/users';
import {TokenScope} from '../models/auth';
import AppConfig, {Constants as ConfigConstants} from '../lib/config/config';

const initCertsConfig: InitCertsConfig = require(path.join(ConfigConstants.ConfigInitDir, 'certs-config.json'));

async function configure() {
  try {
    var siteUser: User = await User.findByUsername('site', Users.UserType.System);
    var adminUser: User = await User.findByUsername('admin', Users.UserType.Login);
    if (adminUser) {
      adminUser.delete();
    }
    adminUser = await User.create(Users.UserType.Login, 'admin', 'admin@login');
    await adminUser.setPermissionScopes([TokenScope.Admin, TokenScope.Public]);

    var certSubject: CertSubject = new CertSubject(initCertsConfig.ca, {
      commonName: 'admin',
      emailAddress: 'admin@login'
    });
    var siteCertsManager: SiteCertsManager = await SiteCertsManager.getInstance(siteUser);
    var clientCertBundle = await siteCertsManager.createClientCert(certSubject.subject, adminUser, CertType.Site);
    console.log(clientCertBundle);

    charonSequelize.close();
    // admin user
  } catch (e) {
    console.error(e);
    throw e;
  }
}

configure();
