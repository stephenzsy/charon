import {Config, NamedConfig} from './common';

export interface ListenConfigOption {
  port: number;
}

export class ListenConfig extends Config {
  constructor(opt: ListenConfigOption) {
    super('listen');
    this.addConfig('ipaddr', '*');
    this.addConfig('port', opt.port);
    this.addConfig('clients', 'TODO');
  }
}

export class AuthorizeConfig extends Config {
  constructor() {
    super('authorize');
    this.addConfig('eap', 'TODO');
  }
}

export interface ServerConfigOption {
  name: string;
  listen: ListenConfigOption;
}

export class ServerConfig extends NamedConfig {
  constructor(opt: ServerConfigOption) {
    super('server', opt.name);
    this.addConfig('listen', new ListenConfig(opt.listen))
    this.addConfig('authorize', new AuthorizeConfig());
  }
}
