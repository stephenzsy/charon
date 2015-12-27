///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';
import * as commander from 'commander';

import {CertConfig} from '../lib/models/security-configs';
import {CertsConfig} from './interfaces';
import {createPrivateKeyFile} from '../lib/certs/utils';

var certsConfig: CertsConfig = require('../config/certs-config.json');

function getSubject(config: CertsConfig) {
  if (!config) {
    throw 'No configuraiton'
  }
  var subj: string = '';
  if (!config.country) {
    throw 'Country code required for cert subject'
  }
  subj += '/C=' + config.country;
  if (!config.stateOrProviceName) {
    throw 'State or province name required for cert subject';
  }
  subj += '/ST=' + config.stateOrProviceName;
  if (!config.localityName) {
    throw 'Locality name required for cert subject';
  }
  subj += '/L=' + config.localityName;
  if (!config.organizationName) {
    throw 'Organization name required for cert subject';
  }
  subj += '/O=' + config.organizationName;
  if (config.organizationUnitName) {
    subj += '/OU=' + config.organizationUnitName;
  }
  if (!config.commonName) {
    throw 'Common name required for cert subject';
  }
  subj += '/CN=' + config.commonName;
  if (config.emailAddress) {
    subj += '/emailAddress=' + config.emailAddress;
  }
  return subj;
}

var configCertsCaDir: string = path.join(__dirname, '../config/certs/ca');
var configCertsCaKeyPem: string = path.join(configCertsCaDir, 'ca-key.pem');
var configCertsCaCertPem: string = path.join(configCertsCaDir, 'ca-crt.pem');

fsExtra.mkdirpSync(configCertsCaDir);

// create CA private key
createPrivateKeyFile(configCertsCaKeyPem)
  .then(() => {
  // create CA CSR
  child_process.execFileSync('openssl', [
    'req',
    '-new',
    '-x509',
    '-extensions', 'v3_ca',
    '-key', configCertsCaKeyPem,
    '-out', configCertsCaCertPem,
    '-subj', getSubject(certsConfig),
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
