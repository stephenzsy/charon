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
import User, * as Users from '../lib/models/users';

const NetworksConfig: NetworkConfig[] = require('../config/init/networks-config.json');

import {CertConfig, CertSubject} from '../lib/models/certs';
import {InitCertsConfig} from '../models/init';
const initCertsConfig: InitCertsConfig = require(path.join(Shared.ConfigInitDir, 'certs-config.json'));

var counter: number = 0;
var portBase: number = 10000;
async function configureNetwork(config: NetworkConfig, networksUser: User, rootUser: User): Promise<INetwork> {
  var radcheckTableName: string = 'radcheck' + (++counter);
  var radcheckModel = db.getRadcheckModel(radcheckTableName);

  await radcheckModel.sync({ force: true });

  var password: string = await createBase62Password(128);
  var network: Network = new Network({
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
  await certsManager.createCaCert(caCertSubject.subject, networksUser, network, rootUser);

  // create server cert
  var serverCertSubject: CertSubject = new CertSubject(initCertsConfig.ca, {
    commonName: config.certCommonName,
    emailAddress: config.certEmail
  });
  var bundle: CertBundle = await certsManager.createNetworkServerCert(serverCertSubject.subject, networksUser, network);

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
  try {
    var rootUser: User = await User.findByUsername('root', Users.UserType.System);
    var networksUser: User = await User.findByUsername('networks', Users.UserType.System);
    if (networksUser) {
      networksUser.delete();
    }
    networksUser = await User.create(Users.UserType.System, 'networks', 'networks@system');
    var networks: INetwork[] = await Promise.all(NetworksConfig.map(config => configureNetwork(config, networksUser, rootUser)));
    db.radiusSequelize.close();
    db.charonSequelize.close();
    Shared.writeJsonSync(path.join(Shared.ConfigDir, 'networks-config.json'), networks);
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
