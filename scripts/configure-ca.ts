///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import 'babel-polyfill';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';

import * as Shared from './shared';
import {CertConfig, CertSubjectConfig} from '../lib/models/certs';
import {createPrivateKey, getSubject} from '../lib/certs/utils';
import {CertInternal, CertInstance} from '../lib/db/certs';
import {caCertBundle} from '../lib/certs/ca';
import {certsManager} from '../lib/certs/certs-manager';

var certsSubjectConfig: CertSubjectConfig = require('../config/init/certs-config.json');

function configureSubject(config: CertSubjectConfig) {
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
  return getSubject(config);
}

const configCertsCaDir: string = path.join(Shared.ConfigCertsDir, 'ca');
const configCertsSiteDir: string = path.join(Shared.ConfigCertsDir, 'site');
const configCertsServerDir: string = path.join(Shared.ConfigCertsDir, 'server');
const configCertsClientDir: string = path.join(Shared.ConfigCertsDir, 'client');

var configCertsCaKeyPem: string = path.join(configCertsCaDir, 'ca.key');
var configCertsCaCertPem: string = path.join(configCertsCaDir, 'ca.crt');

async function createCACertEntry(): Promise<CertInstance> {
  return db.CertModel.create(<CertInternal>{
    type: CertTypeStr.CA,
    subject: caCertBundle.certificateSubject,
    state: CertStateStr.Active,
    networkId: Constants.UUID0
  });
}


async function configureCa() {
  // create CA private key
  await createPrivateKey(configCertsCaKeyPem);

  var subject: string = configureSubject(certsSubjectConfig);
  // create CA CSR
  child_process.execFileSync('openssl', [
    'req',
    '-new',
    '-x509',
    '-extensions', 'v3_ca',
    '-key', configCertsCaKeyPem,
    '-out', configCertsCaCertPem,
    '-set_serial', '1',
    '-sha384',
    '-subj', subject,
    '-days', '3650']);

  var configCertsCaConfigJson: string = path.join(configCertsCaDir, 'ca.json');

  var certText: string = child_process.execFileSync('openssl', [
    'x509',
    '-in', configCertsCaCertPem,
    '-text',
    '-noout']).toString();

  // generate json config
  var config: CertConfig = {
    certificatePemContent: fs.readFileSync(configCertsCaCertPem).toString(),
    certificatePemFile: configCertsCaCertPem,
    privateKeyPemFile: configCertsCaKeyPem,
    subject: subject,
    certificateMetadata: certText
  };

  fsExtra.writeJsonSync(configCertsCaConfigJson, config);
}

async function configureSite() {

}

async function configure() {
  fsExtra.mkdirpSync(configCertsCaDir);
  fsExtra.mkdirpSync(configCertsSiteDir);
  fsExtra.mkdirpSync(configCertsServerDir);
  fsExtra.mkdirpSync(configCertsClientDir);
  await configureCA();
  configureSite();
}

configure();
