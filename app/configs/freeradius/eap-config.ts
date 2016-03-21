import * as uuid from 'node-uuid';
import {Config, NamedConfig} from '../common';

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
    this.addKeyedConfig('auto_chain', 'no');
    this.addKeyedConfig('ecdh_curve', '"secp384r1"');
  }
}

export interface TtlsConfigOptions {
  tls: string;
  virtualServer: string;
}

export class TtlsConfig extends Config {
  constructor(opt: TtlsConfigOptions) {
    super('ttls');
    this.addKeyedConfig('tls', opt.tls);
    this.addKeyedConfig('default_eap_type', 'mschapv2');
    this.addKeyedConfig('virtual_server', opt.virtualServer);
  }
}

export class MschapV2Config extends Config {
  constructor(opt: {}) {
    super('mschapv2');
  }
}

export interface EapConfigOptions {
  name: string;
  defaultEapType: string;
  tlsConfig?: TlsConfigOptions;
  ttls?: TtlsConfigOptions;
  mschapv2?: {};
}

export class EapConfig extends NamedConfig {
  constructor(opt: EapConfigOptions) {
    super('eap', opt.name);
    this.addKeyedConfig('default_eap_type', opt.defaultEapType);
    this.addKeyedConfig('timer_expire', 60);
    this.addKeyedConfig('ignore_unknown_eap_types', 'no');
    this.addKeyedConfig('max_sessions', '${max_requests}');
    if (opt.tlsConfig) {
      this.addConfig(new TlsConfig(opt.tlsConfig));
    }
    if (opt.ttls) {
      this.addConfig(new TtlsConfig(opt.ttls));
    }
    if (opt.mschapv2) {
      this.addConfig(new MschapV2Config(opt.mschapv2));
    }
  }
}
