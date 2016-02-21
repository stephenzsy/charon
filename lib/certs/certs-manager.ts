///<reference path="../../typings/mysql/mysql.d.ts"/>

import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import * as child_process from 'child_process';

import * as Q from 'q';
import {Cert, CertType, CertBundle, CertConfig} from '../models/certs';
import {Network} from '../models/networks';
import User from '../models/users';

import * as Utils from './utils';
import {createBase62Password} from '../secrets/utils';

const CertsConfigDir: string = path.resolve(__dirname, '../../config/certs');
const ClientCertsConfigDir = path.join(CertsConfigDir, 'client');
const SiteCertsConfigDir = path.join(CertsConfigDir, 'site');
const ServerCertsConfigDir = path.join(CertsConfigDir, 'server');
const CaCertsConfigDir = path.join(CertsConfigDir, 'ca');
const SiteConfigJson: string = path.join(SiteCertsConfigDir, 'site.json');
const CaConfigJson: string = path.join(CaCertsConfigDir, 'ca.json');

export class CertsManager {

  private caCertConfig: CertConfig;

  constructor() {
  }

  async clearAllServerCerts(): Promise<void> {
    return Cert.clearAllServerCerts();
  }

  async createNetworkServerCert(subject: string, user: User, network: Network): Promise<CertBundle> {
    return this.createCert(subject, CertType.Server, ServerCertsConfigDir, user, network, 'server', false, user);
  }

  async createSiteCert(subject: string, user: User): Promise<CertBundle> {
    var certBundle = await this.createCert(subject, CertType.Site, SiteCertsConfigDir, user, null, 'site', false, user);

    // generate json config
    var certConfig: CertConfig = {
      certificatePemFile: certBundle.certificatePemFile,
      privateKeyPemFile: certBundle.privateKeyPemFile
    };

    fsExtra.writeJsonSync(SiteConfigJson, certConfig);
    return certBundle;
  }

  async createCaCert(subject: string, user: User, network: Network, signingUser: User): Promise<CertBundle> {
    var certBundle = await this.createCert(subject, CertType.CA, CaCertsConfigDir, user, network, 'ca', false, signingUser);

    if (!signingUser) {
      var certConfig: CertConfig = {
        certificatePemFile: certBundle.certificatePemFile,
        privateKeyPemFile: certBundle.privateKeyPemFile
      };

      fsExtra.writeJsonSync(CaConfigJson, certConfig);
    }
    return certBundle;
  }

  private async createCert(subject: string, certType: CertType, certsRootDir:
    string, user: User, network: Network, prefix: string,
    createExportable: boolean,
    signingUser: User): Promise<CertBundle> {
    var cert: Cert;
    cert = await Cert.createPending(certType, subject, network, user);

    var serial: number = cert.sequenceId;
    var certsDir: string;
    certsDir = path.join(certsRootDir, serial.toString());
    fsExtra.mkdirpSync(certsDir);
    // private key
    var privateKeyPath: string = path.join(certsDir, prefix + '.key');
    var crtPath: string = path.join(certsDir, prefix + '.crt');
    await Utils.createPrivateKey(privateKeyPath);
    if (certType === CertType.CA && !signingUser) {
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
    } else if (certType === CertType.CA) {
      // csr
      var csrPath: string = path.join(certsDir, prefix + '.csr');
      await Utils.createCsr(privateKeyPath, subject, csrPath);
      var signingCertSerial: number = await signingUser.getCaCertSerial(null);
      // certificate
      await Utils.signCertificate(
        path.join(CaCertsConfigDir, signingCertSerial.toString(), 'ca.key'),
        path.join(CaCertsConfigDir, signingCertSerial.toString(), 'ca.crt'),
        serial,
        csrPath,
        crtPath,
        true);

    } else {
      // csr
      var csrPath: string = path.join(certsDir, prefix + '.csr');
      await Utils.createCsr(privateKeyPath, subject, csrPath);
      var signingCertSerial: number = await signingUser.getCaCertSerial(network);
      // certificate
      await Utils.signCertificate(
        path.join(CaCertsConfigDir, signingCertSerial.toString(), 'ca.key'),
        path.join(CaCertsConfigDir, signingCertSerial.toString(), 'ca.crt'),
        serial,
        csrPath,
        crtPath,
        true);

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
      //  this.caCertConfig = require(CaConfigJson);
    }
    return new CertBundle(this.caCertConfig);
  }
}

export const certsManager: CertsManager = new CertsManager();
export default certsManager;
