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

const initCertsConfig: InitCertsConfig = require(path.join(Shared.ConfigDir, 'init', 'certs-config.json'));

function configureSubject(config: CaCertSubjectConfig): CertSubject {
  if (!config) {
    throw 'No configuraiton'
  }
  if (!config.country) {
    throw 'Country code required for cert subject'
  }
  if (!config.stateOrProviceName) {
    throw 'State or province name required for cert subject';
  }
  if (!config.localityName) {
    throw 'Locality name required for cert subject';
  }
  if (!config.organizationName) {
    throw 'Organization name required for cert subject';
  }
  if (!config.commonName) {
    throw 'Common name required for cert subject';
  }
  return new CertSubject(config, config);
}

const configCertsCaDir: string = path.join(Shared.ConfigCertsDir, 'ca');
const configCertsSiteDir: string = path.join(Shared.ConfigCertsDir, 'site');
const configCertsServerDir: string = path.join(Shared.ConfigCertsDir, 'server');
const configCertsClientDir: string = path.join(Shared.ConfigCertsDir, 'client');

var configCertsCaKeyPem: string = path.join(configCertsCaDir, 'ca.key');
var configCertsCaCertPem: string = path.join(configCertsCaDir, 'ca.crt');

async function configure() {
  var caSubject = configureSubject(initCertsConfig.ca);
  await certsManager.createCaCert(caSubject.subject);
  var siteSubject = new CertSubject(caSubject, initCertsConfig.site);
  await certsManager.createSiteCert(siteSubject.subject);
  charonSequelize.close();
}

try {
  configure();

} catch (err) {
  console.error(err);
}
