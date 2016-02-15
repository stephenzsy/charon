import * as uuid from 'node-uuid';
import {Config, NamedConfig} from './common';

export class PoolConfig extends Config {
  constructor() {
    super('pool');
    this.addConfig('start = ${thread[pool].start_servers}');
    this.addConfig('min = ${thread[pool].min_spare_servers}');
    this.addConfig('max = ${thread[pool].max_servers}');
    this.addConfig('spare = ${thread[pool].max_spare_servers}');
    this.addConfig('users = 0');
    this.addConfig('retry_delay = 30');
    this.addConfig('lifetime = 0');
    this.addConfig('idle_timeout = 60');
  }
}

export interface SqlConfigOption {
  name: string;
  authcheckTable: string;
  pool?: string;
}

export class SqlConfig extends NamedConfig {
  constructor(opt: SqlConfigOption) {
    super('sql', opt.name);
    this.addKeyedConfig('driver', '"rlm_sql_mysql"');
    this.addKeyedConfig('dialect', '"sqlite"');
    this.addKeyedConfig('server', '"localhost"');
    this.addKeyedConfig('port', 3306);
    this.addKeyedConfig('login', '"radius"');
    this.addKeyedConfig('password', '"radpass"');
    this.addKeyedConfig('radius_db', '"radius"');
    this.addKeyedConfig('acct_table1', '"radacct"');
    this.addKeyedConfig('acct_table2', '"radacct"');
    this.addKeyedConfig('postauth_table', '"radpostauth"');
    this.addKeyedConfig('authcheck_table', '"' + opt.authcheckTable + '"');
    this.addKeyedConfig('groupcheck_table', '"radgroupcheck"');
    this.addKeyedConfig('authreply_table', '"radreply"');
    this.addKeyedConfig('groupreply_table', '"radgroupreply"');
    this.addKeyedConfig('usergroup_table', '"radusergroup"');
    this.addConfig('delete_stale_sessions = yes');

    if (opt.pool) {
      this.addKeyedConfig('pool', opt.pool);
    } else {
      this.addConfig(new PoolConfig());
    }
    this.addConfig('client_table = "nas"');
    this.addConfig('group_attribute = "${.:instance}-SQL-Group"');
    this.addConfig('$INCLUDE ${modconfdir}/${.:name}/main/${dialect}/queries.conf');
  }
}
