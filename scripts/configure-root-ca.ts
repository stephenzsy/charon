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

const initCertsConfig: InitCertsConfig = require(path.join(Shared.ConfigDir, 'init', 'certs-config.json'));

async function configure() {
  var rootUser: User = await User.create(Users.UserType.System, 'root', 'root@system');
  var caSubject = new CertSubject(initCertsConfig.ca);
  await certsManager.createCaCert(caSubject.subject, rootUser, null, null);
  charonSequelize.close();
}

try {
  configure();

} catch (err) {
  console.error(err);
}
