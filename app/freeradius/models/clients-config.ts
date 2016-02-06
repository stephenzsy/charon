import * as uuid from 'node-uuid';
import {Config, NamedConfig} from './common';

export interface ClientConfigOptions {
  name: string;
  secret: string;
}

export class ClientConfig extends NamedConfig {
  constructor(opt: ClientConfigOptions) {
    super('client', opt.name);
    this.addKeyedConfig('ipv4addr', '*');
    this.addKeyedConfig('ipv6addr', '::');
    this.addKeyedConfig('secret', opt.secret);
  }
}

export interface ClientsConfigOptions {
  name: string;
  clients: ClientConfigOptions[];
}

export class ClientsConfig extends NamedConfig {
  constructor(opt: ClientsConfigOptions) {
    super('clients', opt.name);
    opt.clients.forEach(clientOpt => {
      this.addConfig(new ClientConfig(clientOpt));
    });
  }
}
