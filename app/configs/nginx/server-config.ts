import {Config, NamedConfig} from '../common';

export interface ServerConfigOption {
  serverName: string;
  proxyPassPort: number;
  sslCertificate: string;
  sslCertificateKey: string;
  sslClientCertificate: string;
  proxySslCertificate: string;
  proxySslCertificateKey: string;
}

export class ServerConfig extends Config {
  constructor(opt: ServerConfigOption) {
    super('server');
    this.addKeyedConfig('server_name', opt.serverName);
  }
}

export class UnsecureRedirectServerConfig extends ServerConfig {
  constructor(opt: ServerConfigOption) {
    super(opt);
    this.addKeyedConfig('listen', '80')
    this.addKeyedConfig('listen', '[::]:80');
    this.addKeyedConfig('return', '301 https://$host$request_uri');
  }
}

export class LocationConfig extends NamedConfig {
  constructor(location: string, opt: ServerConfigOption) {
    super('location', location);
    this.addKeyedConfig('proxy_pass', 'https://[::1]:' + opt.proxyPassPort);
    this.addKeyedConfig('proxy_set_header', 'Host $host');
    this.addKeyedConfig('proxy_set_header', 'x-ssl-client-serial $ssl_client_serial')
    this.addKeyedConfig('proxy_ssl_certificate', opt.proxySslCertificate);
    this.addKeyedConfig('proxy_ssl_certificate_key', opt.proxySslCertificateKey);
  }
}

export class SecureProxyServerConfig extends ServerConfig {
  constructor(opt: ServerConfigOption) {
    super(opt);
    this.addKeyedConfig('listen', '443 ssl');
    this.addKeyedConfig('listen', '[::]:443 ssl');
    this.addKeyedConfig('ssl_certificate', opt.sslCertificate);
    this.addKeyedConfig('ssl_certificate_key', opt.sslCertificateKey);
    this.addKeyedConfig('ssl_client_certificate', opt.sslClientCertificate);
    this.addKeyedConfig('ssl_verify_client', 'optional');
    this.addKeyedConfig('ssl_verify_depth', '2');
    this.addConfig(new LocationConfig('/', opt));
  }
}
