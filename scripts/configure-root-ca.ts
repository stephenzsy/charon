///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import 'babel-polyfill';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';

import {CertSubjectConfig, CaCertSubjectConfig, InitCertsConfig} from '../models/init';
import {CertSubject} from '../lib/models/certs';
import {createPrivateKey} from '../lib/certs/utils';
import {charonSequelize} from '../lib/db/index';
import {CertInternal, CertInstance} from '../lib/db/certs';
import {CertsManager, RootCaCertsManager} from '../lib/certs/certs-managers';
import User, * as Users from '../lib/models/users';
import AppConfig, {Constants as ConfigConstants} from '../lib/config/config';

const initCertsConfig: InitCertsConfig = require(path.join(ConfigConstants.ConfigInitDir, 'certs-config.json'));

async function configure() {
  var rootUser: User = await User.findByUsername('root', Users.UserType.System);
  if (rootUser != null) {
    rootUser.delete(true);
  }
  rootUser = await User.create(Users.UserType.System, 'root', 'root@system');
  var caSubject: CertSubject = new CertSubject(initCertsConfig.ca);
  await RootCaCertsManager.createRootCaCert(caSubject.subject, rootUser);
  charonSequelize.close();
}

async function start() {
  try {
    await configure();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

start();
