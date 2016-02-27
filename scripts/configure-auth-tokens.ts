///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import * as fsExtra from 'fs-extra';
import AppConfig, {AuthTokenConfig, Constants as ConfigConstants} from '../lib/config/config';

var configTokenCertsDir: string = path.join(ConfigConstants.ConfigDir, 'auth-token');
fsExtra.mkdirpSync(configTokenCertsDir);

var ecParamPem: string = path.join(configTokenCertsDir, 'secp384r1.pem');
var ecPrivateKeyPem: string = path.join(configTokenCertsDir, 'ecPrivateKey.pem');
var ecPublicKeyPem: string = path.join(configTokenCertsDir, 'ecPublicKey.pem');

// create ecparam
child_process.execFileSync('openssl', ['ecparam', '-name', 'secp384r1', '-out', ecParamPem]);
child_process.execFileSync('openssl', ['ecparam', '-in', ecParamPem, '-genkey', '-noout', '-out', ecPrivateKeyPem]);
child_process.execFileSync('openssl', ['ec', '-in', ecPrivateKeyPem, '-pubout', '-out', ecPublicKeyPem]);

var config: AuthTokenConfig = {
  algorithm: 'ES384',
  privateKey: fs.readFileSync(ecPrivateKeyPem).toString(),
  publicKey: fs.readFileSync(ecPublicKeyPem).toString()
};
AppConfig.saveAuthTokenConfig(config);
