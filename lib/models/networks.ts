///<reference path="../../typings/sequelize/sequelize.d.ts"/>

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

  get radcheckTableName(): string {
    return this.config.radcheckTableName;
  }

  get radiusPort(): number {
    return this.config.radiusPort;
  }

  static get all(): Network[] {
    return allNetworks;
  }

  static findById(id: string): Network {
    return networksMap[id];
  }
}

const networksMap: { [id: string]: Network } = {}
const allNetworks: Network[] = NetworksConfig.map((config: INetwork): Network => {
  var network: Network = new Network(config);
  networksMap[network.id] = network;
  return network;
});
