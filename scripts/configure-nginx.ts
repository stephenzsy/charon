'use strict';

import * as path from 'path';
import * as fsExtra from 'fs-extra';

import {Generator} from '../app/configs/common';
import {ClientsConfig, ClientsConfigOptions} from '../app/configs/freeradius/clients-config';
import {UnsecureRedirectServerConfig, SecureProxyServerConfig, ServerConfigOption} from '../app/configs/nginx/server-config';
import AppConfig, {Constants as ConfigConstants, NetworkInternal} from '../lib/config/config';
import {CertFileBundle} from '../lib/models/certs';

const proxyCertBundle: CertFileBundle = require(path.join(ConfigConstants.ConfigCertsDir, 'proxy.json'));
const siteCertBundle: CertFileBundle = require(path.join(ConfigConstants.ConfigCertsDir, 'site.json'));

class Configurator {
  private generator: Generator = new Generator();

  configure() {
    fsExtra.writeFileSync(path.join(ConfigConstants.NginxDir, 'charon'), this.configureServers());
  }

  public configureServers(): string {
    var generator: Generator = new Generator(true);
    var opt: ServerConfigOption = {
      serverName: 'localhost',
      proxyPassPort: 3443,
      sslCertificate: siteCertBundle.certificateFile,
      sslCertificateKey: siteCertBundle.privateKeyFile,
      sslClientCertificate: siteCertBundle.certificateChainFile,
      proxySslCertificate: proxyCertBundle.certificateFile,
      proxySslCertificateKey: proxyCertBundle.privateKeyFile
    };
    var unsecureRedirectServer: string = generator.generate(new UnsecureRedirectServerConfig(opt));
    var secureProxy: string = generator.generate(new SecureProxyServerConfig(opt));

    return unsecureRedirectServer + "\n" + secureProxy;
  }
}


var configurator: Configurator = new Configurator();

fsExtra.mkdirpSync(ConfigConstants.NginxDir);
configurator.configure();
