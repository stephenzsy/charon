import * as uuid from 'node-uuid';
import {Config, NamedConfig} from './common';

export interface TlsConfigOptions {
  name: string;
  privateKeyFile: string;
  certificateFile: string;
  caFile: string;
}

export class TlsConfig extends NamedConfig {
  constructor(opt: TlsConfigOptions) {
    super('tls-config', opt.name);
    this.addKeyedConfig('private_key_file', opt.privateKeyFile);
    this.addKeyedConfig('certificate_file', opt.certificateFile);
    this.addKeyedConfig('ca_file', opt.caFile);
    this.addKeyedConfig('ecdh_curve', '"secp384r1"')
  }
}

export interface TtlsConfigOptions {
  tls: string;
}

export class TtlsConfig extends Config {
  constructor(opt: TtlsConfigOptions) {
    super('ttls');
    this.addKeyedConfig('tls', opt.tls);
    this.addKeyedConfig('default_eap_type', 'mschapv2');
  }
}

export interface EapConfigOptions {
  name: string;
  tlsConfig: TlsConfigOptions;
  ttls?: TtlsConfigOptions;
}

export class EapConfig extends NamedConfig {
  constructor(opt: EapConfigOptions) {
    super('eap', opt.name);
    this.addKeyedConfig('default_eap_type', 'ttls');
    this.addKeyedConfig('timer_expire', 60);
    this.addKeyedConfig('ignore_unknown_eap_types', 'no');
    this.addKeyedConfig('max_sessions', '${max_requests}');
    this.addConfig(new TlsConfig(opt.tlsConfig));
    if (opt.ttls) {
      this.addConfig(new TtlsConfig(opt.ttls));
    }
  }
}
