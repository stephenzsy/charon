'use strict';
import * as path from 'path';
import {Network} from '../models/networks';
import * as Shared from './shared';

import {Generator} from '../app/freeradius/models/common';
import {ServerConfig} from '../app/freeradius/models/server-config';
const networks: Network[] = require(path.join(Shared.ConfigDir, 'networks-config.json'))

class Configurator {

  public static configureServers(): string {
    var generator: Generator = new Generator();
    return networks.map(network => {
      let config: ServerConfig = new ServerConfig({
        name: network.id,
        listen: {
          port: 0
        }
      });
      return generator.generate(config);
    }).join("\n");
  }
}

console.log(Configurator.configureServers());
