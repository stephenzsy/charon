///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Q from 'q';
var _Q = require('q');

import {Network as INetwork} from '../../models/networks';
const NetworksConfig: INetwork[] = require('../../config/networks-config.json');

export class Network {
  private config: INetwork;

  constructor(config: INetwork) {
    this.config = config;
  }

  get id(): string {
    return this.config.id;
  }

  get name(): string {
    return this.config.name;
  }

  get clientSecret(): string {
    return this.config.clientSecret;
  }

  get dbName(): string {
    return this.config.dbName;
  }

  static get all(): Network[] {
    return allNetworks;
  }
}

const allNetworks: Network[] = NetworksConfig.map((config: INetwork): Network => {
  return new Network(config);
});
