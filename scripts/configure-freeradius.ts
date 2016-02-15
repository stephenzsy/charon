'use strict';
import * as path from 'path';
import * as fsExtra from 'fs-extra';

import {Network} from '../models/networks';
import certsManager from '../lib/certs/certs-manager';

import * as Shared from './shared';
import {Generator} from '../app/freeradius/models/common';
import {ClientsConfig, ClientsConfigOptions} from '../app/freeradius/models/clients-config';
import {ServerConfig, ServerConfigOption} from '../app/freeradius/models/server-config';
import {EapConfig} from '../app/freeradius/models/eap-config';
import {SqlConfig, SqlConfigOption} from '../app/freeradius/models/sql-config';

const networks: Network[] = require(path.join(Shared.ConfigDir, 'networks-config.json'));
const ConfigSitesAvailableDir: string = path.join(Shared.ConfigFreeradiusDir, 'sites-available');
const ModsAvailableDir: string = path.join(Shared.ConfigFreeradiusDir, 'mods-available');

class Configurator {
  private generator: Generator = new Generator();

  configure() {
    fsExtra.writeFileSync(path.join(Shared.ConfigFreeradiusDir, 'clients.conf'), this.configureClients());
    fsExtra.writeFileSync(path.join(ConfigSitesAvailableDir, 'servers'), this.configureServers());
    fsExtra.writeFileSync(path.join(ModsAvailableDir, 'eaps'), this.configureEap());
    fsExtra.writeFileSync(path.join(ModsAvailableDir, 'sqls'), this.configureSql());
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
    var outerServers: string = networks.map(network => {
      let config: ServerConfig = new ServerConfig({
        name: 'server-' + network.id,
        listen: {
          ipaddr: '*',
          port: network.radiusPort,
          clients: 'clients-' + network.id
        },
        authorize: {
          eap: 'eap-' + network.id
        },
        authenticate: {
          eap: 'eap-' + network.id
        },
        accounting: {
          sql: 'sql-' + network.id
        }
      });
      return generator.generate(config);
    }).join("\n");
    var innerServers: string = networks.map(network => {
      var sql: string = 'sql-' + network.id;
      let opt: ServerConfigOption =
        {
          name: 'server-inner-' + network.id,
          listen: {
            port: network.radiusPort + 100,
            ipaddr: '127.0.0.1'
          },
          authorize: {
            eap: 'eap-inner-' + network.id,
            sql: sql
          },
          authenticate: {
            eap: 'eap-inner-' + network.id,
            mschap: {}
          },
          accounting: {
            sql: sql
          }
        };
      return generator.generate(new ServerConfig(opt));
    }).join("\n");
    return outerServers + "\n" + innerServers;
  }

  public configureEap(): string {
    var generator: Generator = new Generator();
    var caCertBundle = certsManager.getCaCertBundle();
    var outerEap: string = networks.map(network => {
      let tlsConfigName: string = 'tls-config-' + network.id;
      let config: EapConfig = new EapConfig({
        name: 'eap-' + network.id,
        defaultEapType: 'ttls',
        tlsConfig: {
          name: tlsConfigName,
          privateKeyFile: network.serverTlsPrivateKey,
          certificateFile: network.serverTlsCert,
          caFile: caCertBundle.certificatePemFile
        },
        ttls: {
          tls: tlsConfigName,
          virtualServer: '"server-inner-' + network.id + '"'
        }
      });
      return generator.generate(config);
    }).join("\n");

    var innerEap: string = networks.map(network => {
      let tlsConfigName: string = 'tls-config-' + network.id;
      let config: EapConfig = new EapConfig({
        name: 'eap-inner-' + network.id,
        defaultEapType: 'mschapv2',
        mschapv2: {}
      });
      return generator.generate(config);
    }).join("\n");

    return outerEap + "\n" + innerEap;
  }

  configureSql(): string {
    var generator: Generator = new Generator();
    var firstSql: string = null;
    var sqls: string = networks.map(network => {
      var sqlName: string = 'sql-' + network.id;
      let opt: SqlConfigOption = {
        name: sqlName,
        authcheckTable: network.radcheckTableName
      };
      if (firstSql) {
        opt.pool = firstSql;
      } else {
        firstSql = sqlName;
      }
      return generator.generate(new SqlConfig(opt));
    }).join("\n");

    return sqls;
  }
}

var configurator: Configurator = new Configurator();
//console.log(configurator.configureEap());
//process.exit(0);

fsExtra.mkdirpSync(Shared.ConfigFreeradiusDir);
fsExtra.mkdirpSync(ConfigSitesAvailableDir);
fsExtra.mkdirpSync(ModsAvailableDir);
configurator.configure();
