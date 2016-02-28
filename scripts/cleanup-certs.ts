///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import 'babel-polyfill';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';

import {CertSubjectConfig, CaCertSubjectConfig, InitCertsConfig} from '../models/init';
import {Cert} from '../lib/models/certs';
import {createPrivateKey} from '../lib/certs/utils';
import {charonSequelize} from '../lib/db/index';
import {CertInternal, CertInstance} from '../lib/db/certs';
import User, * as Users from '../lib/models/users';
import AppConfig, {Constants as ConfigConstants} from '../lib/config/config';

var files: string[] = fs.readdirSync(ConfigConstants.ConfigCertsDir);
async function configure() {
  for (var i = 0; i < files.length; ++i) {
    var file: string = files[i];
    var dirPath: string = path.join(ConfigConstants.ConfigCertsDir, file);
    if (fs.statSync(dirPath).isDirectory()) {
      var cert: Cert = await Cert.findBySerial(Number(file));
      if (!cert) {
        fsExtra.removeSync(dirPath);
      }
    }
  }
  charonSequelize.close();
}

try {
  configure();

} catch (err) {
  console.error(err);
}
