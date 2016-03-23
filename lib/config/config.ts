import * as path from 'path';
import * as fsExtra from 'fs-extra';

import {Network} from '../../models/networks';

export interface AuthTokenConfig {
  algorithm: string;
  privateKey: string;
  publicKey: string;
}

export interface NetworkInternal extends Network {
  radcheckTableName: string;
  serverTlsCert: string;
  serverTlsPrivateKey: string;
  serverTlsCa: string;
}

export interface DbConfig {
  user: string;
  host: string;
  ssl: {
    key: string;
    cert: string;
    ca: string;
  }
}

export module Constants {
  const ConfigRootDir: string = path.join(__dirname, '../../config');
  export const ConfigInitDir: string = path.join(ConfigRootDir, 'init');
  export const ConfigDir: string = path.join(ConfigRootDir, 'generated');
  export const ConfigCertsDir: string = path.join(ConfigDir, 'certs');
  export const FreeradiusDir: string = path.join(ConfigDir, 'freeradius');
  export const DbConfig: string = path.join(ConfigDir, 'mysql.json');
  export const PathAuthTokenConfig: string = path.join(ConfigDir, 'auth-token.json');
  export const PathNetworksConfig: string = path.join(ConfigDir, 'networks-config.json');
  export const NginxDir: string = path.join(ConfigDir, 'nginx');

  const CertsCnfDir: string = path.join(ConfigRootDir, 'certs');
  export const CertsCnfRootCa: string = path.join(CertsCnfDir, 'intermediate-ca.cnf');
}

export class AppConfig {
  private _authTokenConfig: AuthTokenConfig = null;
  private _networksConfig: NetworkInternal[] = null;

  get authTokenConfig(): AuthTokenConfig {
    if (!this._authTokenConfig) {
      this._authTokenConfig = AppConfig.loadConfig<AuthTokenConfig>(Constants.PathAuthTokenConfig);
    }
    return this._authTokenConfig;
  }

  get networksConfig(): NetworkInternal[] {
    if (!this._networksConfig) {
      this._networksConfig = AppConfig.loadConfig<NetworkInternal[]>(Constants.PathNetworksConfig);
    }
    return this._networksConfig;
  }

  saveAuthTokenConfig(config: AuthTokenConfig) {
    this._authTokenConfig = config;
    AppConfig.saveConfig(Constants.PathAuthTokenConfig, config);
  }

  private static loadConfig<T>(path: string): T {
    return <T>require(path);
  }

  private static saveConfig<T>(path: string, config: T) {
    fsExtra.writeJsonSync(path, config);
  }
}

const appConfig = new AppConfig();

export default appConfig;
