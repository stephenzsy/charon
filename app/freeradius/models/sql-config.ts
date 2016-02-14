import * as uuid from 'node-uuid';
import {Config, NamedConfig} from './common';

export interface SqlConfigOptions {
  name: string;
}

export class SqlConfig extends NamedConfig {
  constructor(opt: SqlConfigOptions) {
    super('sql', opt.name);
    this.addKeyedConfig('driver', '"rlm_sql_mysql"');
    this.addKeyedConfig('server', '"localhost"');
    this.addKeyedConfig('port', 3306);
    this.addKeyedConfig('login', '"radius"');
    this.addKeyedConfig('password', '"radpass"');
    this.addKeyedConfig('radius_db', '"radius"');
  }
}
