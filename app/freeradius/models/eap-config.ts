import * as uuid from 'node-uuid';
import {Config, NamedConfig} from './common';

export interface TlsConfigOptions {
  name: string;
  privateKeyFile: string;
}

export class TlsConfig extends NamedConfig {
  constructor(opt: TlsConfigOptions) {
    super('tls-config', opt.name);
    this.addKeyedConfig('private_key_file', opt.privateKeyFile);
  }
}

export interface EapConfigOptions {
  name: string;
  tlsConfig: TlsConfigOptions;
}

export class EapConfig extends NamedConfig {
  constructor(opt: EapConfigOptions) {
    super('eap', opt.name);
    this.addKeyedConfig('default_eap_type', 'ttls');
    this.addKeyedConfig('timer_expire', 60);
    this.addKeyedConfig('ignore_unknown_eap_types', 'no');
    this.addKeyedConfig('max_sessions', '${max_requests}');
    this.addConfig(new TlsConfig(opt.tlsConfig));
  }
}
