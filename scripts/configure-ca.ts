///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';
import * as command from 'commander';

import {CaCertConfig} from '../lib/models/certs-config';

command
  .option('--ca-cert-pem <path>', 'CA certificate PEM file path')
  .parse(process.argv);

var caCertPath: string = command['caCertPem'];

if (!fs.statSync(caCertPath).isFile) {
  throw 'Invalid file path: ' + caCertPath;
}
var configCertsCaDir: string = path.join(__dirname, '../config/certs/ca');
var configCertsCaPem: string = path.join(configCertsCaDir, 'ca.pem');
var configCertsCaText: string = path.join(configCertsCaDir, 'ca.txt');
var configCertsCaConfigJson: string = path.join(configCertsCaDir, 'ca.json');

fsExtra.mkdirpSync(configCertsCaDir);
fsExtra.copySync(caCertPath, configCertsCaPem);

var certText: string = child_process.execFileSync('openssl', [
  'x509',
  '-in', configCertsCaPem,
  '-text',
  '-noout']).toString();

// generate json config
var config: CaCertConfig = {
  certificatePemFile: configCertsCaPem,
  certificateMetadata: certText
};

fsExtra.writeJsonSync(configCertsCaConfigJson, config);
