///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import 'babel-polyfill';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';

import * as Shared from './shared';
import {CertSubjectConfig, CaCertSubjectConfig, InitCertsConfig} from '../models/init';
import {CertConfig, CertSubject} from '../lib/models/certs';
import {createPrivateKey} from '../lib/certs/utils';
import {charonSequelize} from '../lib/db/index';
import {CertInternal, CertInstance} from '../lib/db/certs';
import certsManager from '../lib/certs/certs-manager';
import User, * as Users from '../lib/models/users';

const initCertsConfig: InitCertsConfig = require(path.join(Shared.ConfigInitDir, 'certs-config.json'));


async function configure() {
  try {
    var rootUser: User = await User.findByUsername('root', Users.UserType.System);
    var siteUser: User = await User.findByUsername('site', Users.UserType.System);
    if (siteUser) {
      await siteUser.delete();
    }
    siteUser = await User.create(Users.UserType.System, 'site', 'site@system');
    var caSubject: CertSubject = new CertSubject(initCertsConfig.ca, initCertsConfig.siteCa);
    await certsManager.createCaCert(caSubject.subject, siteUser, null, rootUser);
    var siteSubject: CertSubject = new CertSubject(caSubject, initCertsConfig.siteServer);
    await certsManager.createSiteCert(siteSubject.subject, siteUser);
    charonSequelize.close();
    // admin user
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
