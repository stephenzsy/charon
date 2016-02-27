///<reference path="../../typings/mysql/mysql.d.ts"/>

import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import * as child_process from 'child_process';

import {Constants as AppConfigConstants} from '../config/config';
import * as Q from 'q';
import {Cert, CertType, CertBundle, CertFileBundle} from '../models/certs';
import {Network} from '../models/networks';
import User from '../models/users';

import * as Utils from './utils';
import {createBase62Password} from '../secrets/utils';

export interface CreatePendingCertResult {
  bundle: CertFileBundle;
  cert: Cert;
  serial: number;
}

export class CertsManager {
  async createNetworkServerCert(subject: string, user: User, network: Network): Promise<CertFileBundle> {
    return this.createCert(subject, CertType.Server, user, network, 'server', false, user, false, true);
  }

  async createSiteCert(subject: string, user: User): Promise<CertFileBundle> {
    var bundle: CertFileBundle = await this.createCert(subject, CertType.Site, user, null, 'site', false, user, true, false);
    await this.saveCertBundleConfig(path.join(AppConfigConstants.ConfigCertsDir, 'site.json'), bundle);
    return bundle;
  }
  /*
    async createCaCert(subject: string, user: User, network: Network, signingUser: User): Promise<CertFileBundle> {
      return this.createCert(subject, CertType.CA, user, network, 'ca', false, signingUser);
    }
  */
  protected async createPendingCertWithPrivateKey(prefix: string, certType: CertType, user: User, network: Network, subject: string): Promise<CreatePendingCertResult> {
    var cert: Cert = await Cert.createPending(certType, subject, network, user);
    var serial: number = cert.sequenceId;
    var certsDir: string = path.join(AppConfigConstants.ConfigCertsDir, serial.toString());
    await CertsManager.mkdirp(certsDir);
    var privateKeyPath: string = path.join(certsDir, prefix + '.key');
    await Utils.createPrivateKey(privateKeyPath);
    return {
      cert: cert,
      serial: cert.sequenceId,
      bundle: {
        bundleDirectory: certsDir,
        certificateFile: null,
        privateKeyFile: privateKeyPath,
        certificateChainFile: null
      }
    };
  }

  private static async mkdirp(dir: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fsExtra.mkdirp(dir, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  private async createCert(subject: string, certType: CertType,
    user: User, network: Network, prefix: string,
    createExportable: boolean,
    signingUser: User,
    withChain: boolean, bundleChainWithCert: boolean): Promise<CertFileBundle> {
    var result: CreatePendingCertResult = await this.createPendingCertWithPrivateKey(prefix, certType, user, network, subject);
    var bundle: CertFileBundle = result.bundle;
    var certsDir: string = bundle.bundleDirectory;
    var serial: number = result.serial;
    var crtPath = path.join(certsDir, prefix + '.crt');

    // csr
    var csrPath: string = path.join(certsDir, prefix + '.csr');
    await Utils.createCsr(bundle.privateKeyFile, subject, csrPath);
    var signingCertSerial: number = await signingUser.getCaCertSerial(network);
    var caFileBundle: CertFileBundle = this.getCertFileBundle(signingCertSerial);

    // certificate
    await Utils.signCertificate(
      caFileBundle.privateKeyFile,
      caFileBundle.certificateFile,
      serial,
      csrPath,
      crtPath,
      365);

    // chain
    if (withChain) {
      let certificateChainFile: string = path.join(certsDir, 'chain.pem');
      await Utils.writeFile(certificateChainFile, await Utils.readFile(caFileBundle.certificateFile));
      if (caFileBundle.certificateChainFile) {
        await Utils.appendFile(certificateChainFile, await Utils.readFile(caFileBundle.certificateChainFile));
      }
      bundle.certificateChainFile = certificateChainFile;
    }

    if (bundleChainWithCert) {
      await Utils.appendFile(crtPath, await Utils.readFile(caFileBundle.certificateChainFile));
      if (caFileBundle.certificateChainFile) {
        await Utils.appendFile(crtPath, await Utils.readFile(caFileBundle.certificateChainFile));
      }
    }

    bundle.certificateFile = crtPath;
    var bundleConfigPath: string = path.join(bundle.bundleDirectory, 'bundle.json');
    await this.saveCertBundleConfig(bundleConfigPath, bundle);
    await result.cert.markAsActive();
    return bundle;
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

  protected saveCertBundleConfig(filePath: string, bundle: CertFileBundle): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fsExtra.writeJson(filePath, bundle, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(filePath);
      });
    });
  }

  private getCertFileBundle(serial: number): CertFileBundle {
    return require(path.join(AppConfigConstants.ConfigCertsDir, serial.toString(), 'bundle.json'));
  }
}

export const certsManager: CertsManager = new CertsManager();
export default certsManager;
