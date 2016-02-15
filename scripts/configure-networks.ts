///<reference path="../typings/q/Q.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

'use strict';

import 'babel-polyfill';

import * as path from 'path';
import * as Q from 'q';
const _Q = require('q');
import * as UUID from 'node-uuid';

import * as sequelize from 'sequelize';

import * as Shared from './shared';
import * as db from '../lib/db/index';
import {Network as INetwork} from '../models/networks';
import {Network} from '../lib/models/networks';
import {NetworkConfig} from '../lib/config/networks';
import {createBase62Password} from '../lib/secrets/utils';
import {certsManager} from '../lib/certs/certs-manager';
import {CertBundle} from '../lib/models/certs';

const NetworksConfig: NetworkConfig[] = require('../config/init/networks-config.json');

import {CertConfig, CertSubject} from '../lib/models/certs';
import {InitCertsConfig} from '../models/init';
const initCertsConfig: InitCertsConfig = require(path.join(Shared.ConfigInitDir, 'certs-config.json'));

var counter: number = 0;
var portBase: number = 10000;
async function configureNetwork(config: NetworkConfig): Promise<INetwork> {
  var radcheckTableName: string = 'radcheck' + (++counter);
  var radcheckModel = db.getRadcheckModel(radcheckTableName);
  try {
    await radcheckModel.sync({ force: true });
  } catch (e) {
    console.error(e);
    throw e;
  }
  var password: string = await createBase62Password(128);
  var network: Network = new Network({
    id: UUID.v4(),
    name: config.name,
    clientSecret: password,
    radiusPort: portBase + 812,
    radcheckTableName: radcheckTableName
  });
  portBase += 1000;

  // create cert
  var certSubject: CertSubject = new CertSubject(initCertsConfig.ca, {
    commonName: config.certCommonName,
    emailAddress: config.certEmail
  });
  var bundle: CertBundle = await certsManager.createServerCert(certSubject.subject, network);

  return {
    id: network.id,
    name: network.name,
    clientSecret: network.clientSecret,
    radcheckTableName: network.radcheckTableName,
    radiusPort: network.radiusPort,
    serverTlsCert: bundle.certificatePemFile,
    serverTlsPrivateKey: bundle.privateKeyPemFile
  };
}

async function configure() {
  await certsManager.clearAllServerCerts();
  var networks: INetwork[] = await Promise.all(NetworksConfig.map(configureNetwork));
  db.radiusSequelize.close();
  db.charonSequelize.close();
  Shared.writeJsonSync(path.join(Shared.ConfigDir, 'networks-config.json'), networks);
}

try {
  configure();
} catch (e) {
  console.error(e);
}
