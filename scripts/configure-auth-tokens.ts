///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';
import * as command from 'commander';

import {AuthTokenConfig} from '../lib/models/security-configs';

// create private key
var privateKey: string = child_process.execFileSync('openssl', [
  'ecparam', '-genkey', '-name', 'secp384r1'
]).toString();

var config:AuthTokenConfig = {
  privateKey: privateKey
};
var configDir: string = path.join(__dirname, '../config');
var configFile: string = path.join(configDir, 'auth-token.json');

fsExtra.mkdirpSync(configDir);
fsExtra.writeJsonSync(configFile, config);
