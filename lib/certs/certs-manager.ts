import * as fs from 'fs';
import * as path from 'path';

import * as Q from 'q';
import * as mysql from 'mysql';

import * as Utils from './utils';

module CertState {
  export const init: string = 'INIT';
}

export interface CertsTableConfig {
  tableName: string;
}

export class CertsManager {
  private dbConnectionPool: mysql.IPool;
  private tableConfig: CertsTableConfig;
  private clientCertsDir: string = path.resolve(__dirname, '../../config/certs/client');
  private caCertsDir: string = path.resolve(__dirname, '../../config/certs/ca');

  constructor(dbConnectionPool: mysql.IPool, certsTableConfig: CertsTableConfig) {
    this.dbConnectionPool = dbConnectionPool;
    this.tableConfig = certsTableConfig;
  }

  public createClientKeypair(subject: string): Q.Promise<void> {
    var serial: number;
    var clientKeypairDir: string;
    var clientPrivateKeyPath: string;
    var clientCsrPath: string;
    var clientCrtPath: string;
    var clientP12Path: string;
    var exportPassword: string;

    return this.acquireNewSerial()
      .then((s: number) => {
      serial = s;
      return this.createClientKeypairDir(serial);
    })
      .then((dir: string) => {
      clientKeypairDir = dir;
      clientPrivateKeyPath = path.join(clientKeypairDir, 'client.key');
      // creat private key
      return Utils.createPrivateKey(clientPrivateKeyPath);
    })
      .then(() => {
      // create csr
      clientCsrPath = path.join(clientKeypairDir, 'client.csr');
      return Utils.createCsr(clientPrivateKeyPath, subject, clientCsrPath);
    })
      .then(() => {
      // sign certificate
      clientCrtPath = path.join(clientKeypairDir, 'client.crt');
      return Utils.signClientCertificate(
        path.join(this.caCertsDir, 'ca.key'),
        path.join(this.caCertsDir, 'ca.crt'),
        serial,
        clientCsrPath,
        clientCrtPath);
    })
      .then(() => {
      // create exportable p12 file
      return Utils.createBase36Password(16);
    }).then((password: string) => {
      exportPassword = password;
      clientP12Path = path.join(clientKeypairDir, 'client.p12');
      console.log(exportPassword);
      return Utils.exportPkcs12(
        clientCrtPath,
        clientPrivateKeyPath,
        path.join(this.caCertsDir, 'ca.crt'),
        exportPassword,
        clientP12Path)
    })
      .then(() => {
      return null;
    }, (err) => {
        console.error(err);
        throw err;
      });
  }

  private createClientKeypairDir(serial: number): Q.Promise<string> {
    var dir: string = path.join(this.clientCertsDir, serial.toString());
    return Q.nfcall(fs.mkdir, dir).then((): string => {
      return dir;
    });
  }

  private acquireNewSerial(): Q.Promise<number> {
    return wrapConnection(this.dbConnectionPool, (connection: mysql.IConnection): Q.Promise<any> => {
      return Q.ninvoke<any>(connection, 'query', 'INSERT INTO ' + this.tableConfig.tableName
        + ' (state) VALUES (?)', [CertState.init]);
    }).then((insertResults: any): number => {
      if (!insertResults || !insertResults[0]) {
        throw 'Mysql error';
      }
      return <number>insertResults[0].insertId;
    });
  }
}

function wrapConnection<T>(pool: mysql.IPool, wrapped: (conn: mysql.IConnection) => Q.Promise<T>): Q.Promise<T> {
  var connection: mysql.IConnection = null;
  return Q.ninvoke<mysql.IConnection>(pool, 'getConnection')
    .then((conn: mysql.IConnection): Q.Promise<T>=> {
    connection = conn;
    return wrapped(connection);
  })
    .then((result: T): T => {
    connection.release();
    return result;
  }, (err): any => {
      connection.release();
      throw err;
    });
}

export var certsManager: CertsManager = new CertsManager(mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'charon',
  connectionLimit: 10
}), { tableName: 'certs' });
