///<reference path="../typings/q/Q.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

'use strict';

import * as path from 'path';
import * as Q from 'q';
const _Q = require('q');
import * as UUID from 'node-uuid';

import * as sequelize from 'sequelize';
const Sequelize: sequelize.SequelizeStatic = require('sequelize');

import * as Shared from './shared';
import {Network} from '../models/networks';
import {NetworkConfig} from '../lib/config/networks';
import {createBase62Password} from '../lib/secrets/utils';

const NetworksConfig: NetworkConfig[] = require('../config/init/networks-config.json');
const charonSequelize: sequelize.Sequelize = new Sequelize('charon', 'root');

var counter: number = 0;

async function configureNetwork(config: NetworkConfig): Promise<Network> {
  var dbName: string = 'rad' + (++counter);

  // create db
  await charonSequelize.query('DROP DATABSE IF EXISTS ' + dbName, { type: sequelize.QueryTypes.RAW });
  await charonSequelize.query('CREATE DATABSE ' + dbName, { type: sequelize.QueryTypes.RAW });
  var password: string = await createBase62Password(128);
  return {
    id: UUID.v4(),
    name: config.name,
    clientSecret: password,
    dbName: dbName,
  };
}

async function configure() {
  var networks: Network[] = await Promise.all(NetworksConfig.map(configureNetwork));
  charonSequelize.close();
  Shared.writeJsonSync(path.join(Shared.ConfigDir, 'networks-config.json'), networks);
}

configure();
