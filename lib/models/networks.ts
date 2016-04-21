///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import AppConfig, {NetworkInternal} from '../config/config';

export class Network {
  private config: NetworkInternal;
  private static _allNetworks: Network[];
  private static _networksMap: { [id: string]: Network };

  constructor(config: NetworkInternal) {
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

  static all(): Network[] {
    if (!Network._allNetworks) {
      Network.loadAllNetworks();
    }
    return Network._allNetworks;
  }

  static findById(id: string): Network {
    if (!Network._networksMap) {
      Network.loadAllNetworks();
    }
    return Network._networksMap[id];
  }

  private static loadAllNetworks() {
    Network._networksMap = {};
    Network._allNetworks = AppConfig.networksConfig.map((config: NetworkInternal): Network => {
      var network: Network = new Network(config);
      Network._networksMap[network.id] = network;
      return network;
    });
  }
}

export default Network;
