'use strict';
import * as path from 'path';
import * as fsExtra from 'fs-extra';

import {Network} from '../models/networks';
import * as Shared from './shared';
import {Generator} from '../app/freeradius/models/common';
import {ClientsConfig, ClientsConfigOptions} from '../app/freeradius/models/clients-config';
import {ServerConfig} from '../app/freeradius/models/server-config';
import {EapConfig} from '../app/freeradius/models/eap-config';
import {caCertBundle} from '../lib/certs/ca';

const networks: Network[] = require(path.join(Shared.ConfigDir, 'networks-config.json'));
const ConfigSitesAvailableDir: string = path.join(Shared.ConfigFreeradiusDir, 'sites-available');
const ModsAvailableDir: string = path.join(Shared.ConfigFreeradiusDir, 'mods-available');

class Configurator {
  private generator: Generator = new Generator();

  configure() {
    fsExtra.writeFileSync(path.join(Shared.ConfigFreeradiusDir, 'clients.conf'), this.configureClients());
    fsExtra.writeFileSync(path.join(ConfigSitesAvailableDir, 'servers'), this.configureServers());
    fsExtra.writeFileSync(path.join(ModsAvailableDir, 'eaps'), this.configureEap());
  }

  private configureClients(): string {
    return networks.map(network => {
      let clientsOpt: ClientsConfigOptions = {
        name: 'clients-' + network.id,
        clients: [{
          name: 'client-' + network.id,
          secret: network.clientSecret
        }]
      };
      return this.generator.generate(new ClientsConfig(clientsOpt));
    }).join('\n');
  }

  public configureServers(): string {
    var generator: Generator = new Generator();
    var base: number = 10000;
    return networks.map(network => {
      let config: ServerConfig = new ServerConfig({
        name: 'server-' + network.id,
        listen: {
          port: 812 + base,
          clients: 'clients-' + network.id
        },
        authorize: {
          eap: 'eap-' + network.id
        },
        authenticate: {
          eap: 'eap-' + network.id
        }
      });
      base += 1000;
      return generator.generate(config);
    }).join("\n");
  }

  public configureEap(): string {
    var generator: Generator = new Generator();
    return networks.map(network => {
      let tlsConfigName: string = 'tls-config-' + network.id;
      let config: EapConfig = new EapConfig({
        name: 'eap-' + network.id,
        tlsConfig: {
          name: tlsConfigName,
          privateKeyFile: network.serverTlsPrivateKey,
          certificateFile: network.serverTlsCert,
          caFile: caCertBundle.certificatePemFile
        },
        ttls: {
          tls: tlsConfigName
        }
      });
      return generator.generate(config);
    }).join("\n");
  }

}

var configurator: Configurator = new Configurator();
console.log(configurator.configureEap());
//process.exit(0);

fsExtra.mkdirpSync(Shared.ConfigFreeradiusDir);
fsExtra.mkdirpSync(ConfigSitesAvailableDir);
fsExtra.mkdirpSync(ModsAvailableDir);
configurator.configure();
