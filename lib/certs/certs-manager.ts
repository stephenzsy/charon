///<reference path="../../typings/mysql/mysql.d.ts"/>

import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';

import * as Q from 'q';
import {Cert, CertType} from '../models/certs';
import {Network} from '../models/networks';
import {User} from '../models/users';

import * as Utils from './utils';
import {createBase62Password} from '../secrets/utils';

const CertsConfigDir: string = path.resolve(__dirname, '../../config/certs');
const ClientCertsConfigDir = path.join(CertsConfigDir, 'client');
const ClientSiteConfigDir = path.join(CertsConfigDir, 'site');
const ClientServerConfigDir = path.join(CertsConfigDir, 'server');
const ClientCAConfigDir = path.join(CertsConfigDir, 'ca');

export class CertsManager {

  constructor() {
  }

  async createServerCert(subject: string, network: Network): Promise<string> {
    return this.createCert(subject, network, 'server', 'server_cert', false);
  }

  private async createCert(subject: string, network: Network, prefix: string, extensions: string, createExportable: boolean): Promise<string> {
    var clientP12Path: string;
    var exportPassword: string;
    var cert: Cert;
    if (network) {
      cert = await Cert.createPending(CertType.Server, subject, network, null);
    } else {
      cert = await Cert.createPending(CertType.Site, subject, null, null);
    }

    var serial: number = cert.sequenceId;
    var certsDir: string = path.join(ClientServerConfigDir, serial.toString());
    fsExtra.mkdirpSync(certsDir);
    // private key
    var privateKeyPath: string = path.join(certsDir, prefix + '.key');
    await Utils.createPrivateKey(privateKeyPath);
    // csr
    var csrPath: string = path.join(certsDir, prefix + '.csr');
    await Utils.createCsr(privateKeyPath, subject, csrPath, extensions);
    // certificate
    var crtPath: string = path.join(certsDir, prefix + '.crt');
    await Utils.signCertificate(
      path.join(ClientCAConfigDir, 'ca.key'),
      path.join(ClientCAConfigDir, 'ca.crt'),
      serial,
      csrPath,
      crtPath);
    return null;
    /*
        return Q.resolve<void>(null)
          .then(() => {
            // create exportable p12 file
            return createBase62Password(16);
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
          });*/
  }
}

export const certsManager: CertsManager = new CertsManager();
