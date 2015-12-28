///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';
import * as commander from 'commander';

import {CertSubjectConfig} from '../lib/models/cert';
import {CertConfig} from '../lib/models/security-configs';
import {createPrivateKey, getSubject} from '../lib/certs/utils';

var certsSubjectConfig: CertSubjectConfig = require('../config/certs-config.json');

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

var configCertsCaDir: string = path.join(__dirname, '../config/certs/ca');
var configCertsCaKeyPem: string = path.join(configCertsCaDir, 'ca.key');
var configCertsCaCertPem: string = path.join(configCertsCaDir, 'ca.crt');

fsExtra.mkdirpSync(configCertsCaDir);

// create CA private key
createPrivateKey(configCertsCaKeyPem)
  .then(() => {
  // create CA CSR
  child_process.execFileSync('openssl', [
    'req',
    '-new',
    '-x509',
    '-extensions', 'v3_ca',
    '-key', configCertsCaKeyPem,
    '-out', configCertsCaCertPem,
    '-sha384',
    '-subj', configureSubject(certsSubjectConfig),
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
    certificateMetadata: certText
  };

  fsExtra.writeJsonSync(configCertsCaConfigJson, config);
});

var configCertsClientDir: string = path.join(__dirname, '../config/certs/client');
fsExtra.mkdirpSync(configCertsClientDir);
