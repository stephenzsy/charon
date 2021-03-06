///<reference path="../typings/q/Q.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

'use strict';

import 'babel-polyfill';

import * as path from 'path';
import * as Q from 'q';
const _Q = require('q');
import * as UUID from 'node-uuid';
import * as fsExtra from 'fs-extra';
import * as sequelize from 'sequelize';

import * as db from '../lib/db/index';
import {Network} from '../lib/models/networks';
import {NetworkConfig} from '../lib/config/networks';
import {createBase62Password} from '../lib/secrets/utils';
import {NetworkCertsManager, RootCaCertsManager} from '../lib/certs/certs-managers';
import {CertSubject} from '../lib/models/certs';
import {CertFileBundle} from '../lib/models/certs';
import User, * as Users from '../lib/models/users';
import {InitCertsConfig} from '../models/init';
import appConfig, {Constants as ConfigConstants, NetworkInternal, DbConfig} from '../lib/config/config';
import {SystemUsers, getSystemUsers} from '../scripts/utils';
import {sqlCharonSetup, sqlRadiusSetup} from './init';

const dbConfig: DbConfig = appConfig.dbConfig;

const initCertsConfig: InitCertsConfig = require(path.join(ConfigConstants.ConfigInitDir, 'certs-config.json'));
const initNetworksConfig: NetworkConfig[] = require(path.join(ConfigConstants.ConfigInitDir, 'networks-config.json'));

function getGrantUserQuery(user: string, host: string, tableName: string): string {
  return "GRANT SELECT,INSERT,UPDATE,DELETE on radius." + tableName + " to '" + user + "'@'" + host + "'"
}

var counter: number = 0;
var portBase: number = 10000;
async function configureNetwork(config: NetworkConfig, networksUser: User, rootUser: User): Promise<NetworkInternal> {
  var radcheckTableName: string = 'radcheck' + (++counter);
  var radcheckModel = db.getRadcheckModel(sqlRadiusSetup, radcheckTableName);

  await radcheckModel.sync({ force: true });
  await sqlRadiusSetup.sql.query(getGrantUserQuery(dbConfig.user, dbConfig.host, radcheckTableName), { type: sequelize.QueryTypes.RAW });

  var password: string = await createBase62Password(128);
  var network: Network = new Network(<NetworkInternal>{
    id: UUID.v4(),
    name: config.name,
    clientSecret: password,
    radiusPort: portBase + 812,
    radcheckTableName: radcheckTableName
  });
  portBase += 1000;

  // create CA cert
  var caCertSubject: CertSubject = new CertSubject(initCertsConfig.ca, {
    commonName: config.certCommonName + " CA",
    emailAddress: config.certEmail
  });
  var rootCertsManager = await RootCaCertsManager.getInstance(rootUser);
  var caFileBundle: CertFileBundle = await rootCertsManager.createIntermediateCa(networksUser, network, caCertSubject.subject);

  // create server cert
  var serverCertSubject: CertSubject = new CertSubject(initCertsConfig.ca, {
    commonName: config.certCommonName,
    emailAddress: config.certEmail
  });
  var networksCertsManager: NetworkCertsManager = await NetworkCertsManager.getInstance(networksUser, network);
  var bundle: CertFileBundle = await networksCertsManager.createNetworkServerCert(serverCertSubject.subject, networksUser);

  return {
    id: network.id,
    name: network.name,
    clientSecret: network.clientSecret,
    radcheckTableName: network.radcheckTableName,
    radiusPort: network.radiusPort,
    serverTlsCert: bundle.certificateFile,
    serverTlsPrivateKey: bundle.privateKeyFile,
    serverTlsCa: caFileBundle.certificateFile
  };
}

async function configure() {
  var systemUsers: SystemUsers = await getSystemUsers();
  try {
    var networks: NetworkInternal[] = [];
    for (var i = 0; i < initNetworksConfig.length; ++i) {
      var config: NetworkConfig = initNetworksConfig[i];
      networks.push(await configureNetwork(config, systemUsers.network, systemUsers.root));
    }
    sqlRadiusSetup.sql.close();
    db.charonSequelize.close();
    fsExtra.writeJsonSync(path.join(ConfigConstants.ConfigDir, 'networks-config.json'), networks);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

try {
  configure();
} catch (e) {
  console.error(e);
}
