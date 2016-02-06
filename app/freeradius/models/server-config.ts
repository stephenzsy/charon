import * as uuid from 'node-uuid';
import {Config, NamedConfig} from './common';

export interface ListenConfigOption {
  port: number;
  clients: string;
}

export class ListenConfig extends Config {
  constructor(opt: ListenConfigOption) {
    super('listen');
    this
      .addKeyedConfig('ipaddr', '*')
      .addKeyedConfig('port', opt.port)
      .addKeyedConfig('clients', opt.clients);
  }
}

export class AuthorizeEapConfig extends Config {
  constructor(name: string) {
    super(name);
    this.addKeyedConfig('ok', 'return');
  }
}

export interface AuthorizeConfigOption {
  eap: string;
}

export class AuthorizeConfig extends Config {
  constructor(opt: AuthorizeConfigOption) {
    super('authorize');
    this
      .addConfig('filter_username')
      .addConfig('preprocess')
      .addConfig(new AuthorizeEapConfig(opt.eap))
      .addConfig('expiration')
      .addConfig('logintime');
  }
}

export interface AuthenticateConfigOption {
  eap: string;
}

export class AuthenticateConfig extends Config {
  constructor(opt: AuthenticateConfigOption) {
    super('authenticate');
    this.addConfig(opt.eap);
  }
}

export class PreacctConfig extends Config {
  constructor() {
    super('preacct');
    this
      .addConfig('preprocess')
      .addConfig('acct_unique');
  }
}

export interface ServerConfigOption {
  name: string;
  listen: ListenConfigOption;
  authorize: AuthorizeConfigOption;
  authenticate: AuthenticateConfigOption;
}

export class ServerConfig extends NamedConfig {
  constructor(opt: ServerConfigOption) {
    super('server', opt.name);
    this
      .addConfig(new ListenConfig(opt.listen))
      .addConfig(new AuthorizeConfig(opt.authorize))
      .addConfig(new AuthenticateConfig(opt.authenticate))
      .addConfig(new PreacctConfig());
  }
}
