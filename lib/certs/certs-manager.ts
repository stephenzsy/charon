///<reference path="../../typings/mysql/mysql.d.ts"/>

import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import * as child_process from 'child_process';

import * as Q from 'q';
import {Cert, CertType, CertBundle, CertConfig} from '../models/certs';
import {Network} from '../models/networks';
import {User} from '../models/users';

import * as Utils from './utils';
import {createBase62Password} from '../secrets/utils';

const CertsConfigDir: string = path.resolve(__dirname, '../../config/certs');
const ClientCertsConfigDir = path.join(CertsConfigDir, 'client');
const SiteCertsConfigDir = path.join(CertsConfigDir, 'site');
const ServerCertsConfigDir = path.join(CertsConfigDir, 'server');
const CaCertsConfigDir = path.join(CertsConfigDir, 'ca');
const CaConfigJson: string = path.join(CaCertsConfigDir, 'ca.json');

export class CertsManager {

  private caCertConfig: CertConfig;

  constructor() {
  }

  async clearAllServerCerts(): Promise<void> {
    return Cert.clearAllServerCerts();
  }

  async createServerCert(subject: string, network: Network): Promise<CertBundle> {
    return this.createCert(subject, CertType.Server, ServerCertsConfigDir, network, 'server', false);
  }

  async createSiteCert(subject: string): Promise<CertBundle> {
    return this.createCert(subject, CertType.Site, SiteCertsConfigDir, null, 'site', false);
  }

  async createCaCert(subject: string): Promise<CertBundle> {
    var certBundle: CertBundle = await this.createCert(subject, CertType.CA, CaCertsConfigDir, null, 'ca', false);

    var certText: string = child_process.execFileSync('openssl', [
      'x509',
      '-in', certBundle.certificatePemFile,
      '-text',
      '-noout']).toString();

    // generate json config
    this.caCertConfig = {
      certificatePemFile: certBundle.certificatePemFile,
      privateKeyPemFile: certBundle.privateKeyPemFile,
      subject: subject,
      certificateMetadata: certText
    };

    fsExtra.writeJsonSync(CaConfigJson, this.caCertConfig);
    return certBundle;
  }

  private async createCert(subject: string, certType: CertType, certsRootDir: string, network: Network, prefix: string, createExportable: boolean): Promise<CertBundle> {
    var cert: Cert;
    cert = await Cert.createPending(certType, subject, network, null);

    var serial: number = cert.sequenceId;
    var certsDir: string;
    if (certType === CertType.CA) {
      certsDir = certsRootDir;
    }
    else {
      certsDir = path.join(certsRootDir, serial.toString());
    }
    fsExtra.mkdirpSync(certsDir);
    // private key
    var privateKeyPath: string = path.join(certsDir, prefix + '.key');
    var crtPath: string = path.join(certsDir, prefix + '.crt');
    await Utils.createPrivateKey(privateKeyPath);
    if (certType === CertType.CA) {
      child_process.execFileSync('openssl', [
        'req',
        '-new',
        '-x509',
        '-extensions', 'v3_ca',
        '-key', privateKeyPath,
        '-out', crtPath,
        '-set_serial', serial.toString(),
        '-sha384',
        '-subj', subject,
        '-days', '3650']);
    } else {
      // csr
      var csrPath: string = path.join(certsDir, prefix + '.csr');
      await Utils.createCsr(privateKeyPath, subject, csrPath);
      // certificate
      await Utils.signCertificate(
        path.join(CaCertsConfigDir, 'ca.key'),
        path.join(CaCertsConfigDir, 'ca.crt'),
        serial,
        csrPath,
        crtPath);
    }
    await cert.markAsActive();
    return new CertBundle({
      certificatePemFile: crtPath,
      privateKeyPemFile: privateKeyPath
    });
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

  getCaCertBundle(): CertBundle {
    if (!this.caCertConfig) {
      this.caCertConfig = require(CaConfigJson);
    }
    return new CertBundle(this.caCertConfig);
  }
}

export const certsManager: CertsManager = new CertsManager();
export default certsManager;
