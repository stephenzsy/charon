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
import {CertsManager, RootCaCertsManager, SiteCertsManager} from '../lib/certs/certs-managers';
import User, * as Users from '../lib/models/users';
import AppConfig, {Constants as ConfigConstants} from '../lib/config/config';

const initCertsConfig: InitCertsConfig = require(path.join(ConfigConstants.ConfigInitDir, 'certs-config.json'));

async function configure() {
  try {
    var rootUser: User = await User.findByUsername('root', Users.UserType.System);
    var rootCaManager = await RootCaCertsManager.getInstance(rootUser);

    var siteUser: User = await User.findByUsername('site', Users.UserType.System);
    if (siteUser) {
      await siteUser.delete(true);
    }
    siteUser = await User.create(Users.UserType.System, 'site', 'site@system');
    var siteCaSubject: CertSubject = new CertSubject(initCertsConfig.ca, initCertsConfig.siteCa);
    await rootCaManager.createIntermediateCa(siteUser, null, siteCaSubject.subject);
    var siteSubject: CertSubject = new CertSubject(siteCaSubject, initCertsConfig.siteServer);
    var siteCertsManager: SiteCertsManager = await SiteCertsManager.getInstance(siteUser);
    await siteCertsManager.createSiteCert(siteSubject.subject, siteUser, 'site',
      initCertsConfig.siteServer.subjectAltDnsNames, initCertsConfig.siteServer.subjectAltIps, true);

    var proxyUser: User = await User.findByUsername('proxy', Users.UserType.System);
    if (proxyUser) {
      await proxyUser.delete(true);
    }
    proxyUser = await User.create(Users.UserType.System, 'proxy', 'proxy@system');
    var proxyCaSubject: CertSubject = new CertSubject(initCertsConfig.ca, initCertsConfig.proxyCa);
    await rootCaManager.createIntermediateCa(proxyUser, null, proxyCaSubject.subject);
    var proxySubject: CertSubject = new CertSubject(proxyCaSubject, initCertsConfig.proxyServer);
    var proxyCertsManager: SiteCertsManager = await SiteCertsManager.getInstance(proxyUser);
    await proxyCertsManager.createSiteCert(proxySubject.subject, proxyUser, 'proxy',
      initCertsConfig.proxyServer.subjectAltDnsNames, initCertsConfig.proxyServer.subjectAltIps, false);
    var proxyClientSubject: CertSubject = new CertSubject(proxyCaSubject, initCertsConfig.proxyClient);
    await proxyCertsManager.createClientCert(proxyClientSubject.subject, proxyUser, false, 'proxy-client');

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
