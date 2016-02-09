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

import {CertConfig, CertSubject, CertSubjectConfig} from '../lib/models/certs';
const certsSubjectConfig: CertSubjectConfig = require('../config/init/certs-config.json');

var counter: number = 0;

async function configureNetwork(config: NetworkConfig): Promise<INetwork> {
  var dbName: string = 'rad' + (++counter);

  // create db
  await db.charonSequelize.query('DROP DATABASE IF EXISTS ' + dbName, { type: sequelize.QueryTypes.RAW });
  await db.charonSequelize.query('CREATE DATABASE ' + dbName, { type: sequelize.QueryTypes.RAW });
  var password: string = await createBase62Password(128);
  var network: Network = new Network({
    id: UUID.v4(),
    name: config.name,
    clientSecret: password,
    dbName: dbName
  });
  // create cert
  var certSubject: CertSubject = new CertSubject(certsSubjectConfig);
  certSubject.commonName = config.certCommonName;
  certSubject.emailAddress = config.certEmail;
  var bundle: CertBundle = await certsManager.createServerCert(certSubject.subject, network);

  return {
    id: network.id,
    name: network.name,
    clientSecret: network.clientSecret,
    dbName: network.dbName,
    serverTlsCert: bundle.certificatePemFile,
    serverTlsPrivateKey: bundle.privateKeyPemFile
  };
}

async function configure() {
  await certsManager.clearAllServerCerts();
  var networks: INetwork[] = await Promise.all(NetworksConfig.map(configureNetwork));
  db.charonSequelize.close();
  Shared.writeJsonSync(path.join(Shared.ConfigDir, 'networks-config.json'), networks);
}

try {
  configure();
} catch (e) {
  console.error(e);
}
