import * as Q from 'q';
import * as mysql from 'mysql';

module CertState {
  export const init: string = 'INIT';
}

export interface CertsTableConfig {
  tableName: string;
}

export class CertsManager {
  private dbConnectionPool: mysql.IPool;
  private tableConfig: CertsTableConfig;

  constructor(dbConnectionPool: mysql.IPool, certsTableConfig: CertsTableConfig) {
    this.dbConnectionPool = dbConnectionPool;
    this.tableConfig = certsTableConfig;
  }

  public createClientKeypair(): Q.Promise<void> {
    return this.acquireNewSerial()
      .then((serial: number) => {
      console.log(serial);
      return null;
    });
  }

  private acquireNewSerial(): Q.Promise<number> {
    var connection: mysql.IConnection = null;
    var newSerial: number;
    return Q.ninvoke<mysql.IConnection>(this.dbConnectionPool, 'getConnection')
      .then((conn: mysql.IConnection) => {
      connection = conn;
      return Q.ninvoke(connection, 'query', 'INSERT INTO ' + this.tableConfig.tableName
        + ' (state) VALUES (?)', [CertState.init]);
    }).then((insertResults: any[]): number => {
      if (!insertResults || !insertResults[0]) {
        throw 'Mysql error';
      }
      newSerial = insertResults[0].insertId;
      connection.release();
      return newSerial;
    });
  }
}

export var certsManager: CertsManager = new CertsManager(mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'charon',
  connectionLimit: 10
}), { tableName: 'certs' });
