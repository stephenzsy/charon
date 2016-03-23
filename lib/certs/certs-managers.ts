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

export abstract class CertsManager {
  private _issuerUser: User;
  private _ca: CertFileBundle;
  private _network: Network;

  constructor(issuerUser: User, ca: CertFileBundle, network: Network) {
    this._issuerUser = issuerUser;
    this._ca = ca;
    this._network = network;
  }

  protected get issuerUser(): User {
    return this._issuerUser;
  }

  protected get ca(): CertFileBundle {
    return this._ca;
  }

  protected get network(): Network {
    return this._network;
  }

  protected static async createPendingCertWithPrivateKey(prefix: string, certType: CertType, user: User, network: Network, subject: string): Promise<CreatePendingCertResult> {
    var cert: Cert = await Cert.createPending(certType, subject, network, user);
    var serial: number = cert.sequenceId;
    var certsDir: string = path.join(AppConfigConstants.ConfigCertsDir, serial.toString());
    await Utils.mkdirp(certsDir);
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

  protected static saveCertBundleConfig(filePath: string, bundle: CertFileBundle): Promise<string> {
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

  protected static getCertFileBundle(serial: number): CertFileBundle {
    return require(path.join(AppConfigConstants.ConfigCertsDir, serial.toString(), 'bundle.json'));
  }
}

const PathRootCaBundleConfig = path.join(AppConfigConstants.ConfigCertsDir, 'root-ca.json');

export class RootCaCertsManager extends CertsManager {

  async createIntermediateCa(user: User, network: Network, subject: string): Promise<CertFileBundle> {
    var prefix: string = 'ca';
    var result: CreatePendingCertResult = await CertsManager.createPendingCertWithPrivateKey(prefix, CertType.CA, user, network, subject);
    var bundle: CertFileBundle = result.bundle;
    var certsDir: string = bundle.bundleDirectory;
    var serial: number = result.serial;
    var crtPath = path.join(certsDir, prefix + '.crt');
    // csr
    var csrPath: string = path.join(certsDir, prefix + '.csr');
    await Utils.createCsr(bundle.privateKeyFile, subject, csrPath);
    var hexSerial: string = serial.toString(16).toUpperCase();

    await Utils.writeFile(path.join(this.ca.bundleDirectory, 'serial'), hexSerial);
    await Utils.writeFile(path.join(this.ca.bundleDirectory, 'index.txt'), '');
    await Utils.writeFile(path.join(this.ca.bundleDirectory, 'index.txt.attr'), '');

    // certificate
    await Utils.signIntermediateCa(
      this.ca.bundleDirectory,
      this.ca.privateKeyFile,
      this.ca.certificateFile,
      serial,
      csrPath,
      certsDir,
      730);

    await Utils.rename(path.join(certsDir, hexSerial + '.pem'), crtPath);

    // chain
    var certificateChainFile: string = path.join(certsDir, 'chain.pem');
    var certContent: string = await Utils.readFile(this.ca.certificateFile);
    await Utils.writeFile(certificateChainFile, certContent);

    bundle.certificateFile = crtPath;
    bundle.certificateChainFile = certificateChainFile;
    var bundleConfigPath: string = path.join(bundle.bundleDirectory, 'bundle.json');
    await CertsManager.saveCertBundleConfig(bundleConfigPath, bundle);
    await result.cert.markAsActive();
    return bundle;
  }

  static async createRootCaCert(subject: string, user: User): Promise<CertFileBundle> {
    var result: CreatePendingCertResult = await this.createPendingCertWithPrivateKey('ca', CertType.CA, user, null, subject);
    var bundle: CertFileBundle = result.bundle;
    bundle.certificateFile = path.join(bundle.bundleDirectory, 'ca.crt');
    await Utils.createRootCaCert(bundle.privateKeyFile, bundle.certificateFile, result.serial, subject);
    await this.saveCertBundleConfig(path.join(bundle.bundleDirectory, 'bundle.json'), bundle);
    await this.saveCertBundleConfig(PathRootCaBundleConfig, bundle);
    await result.cert.markAsActive();
    return bundle;
  }

  static async getInstance(owner: User): Promise<RootCaCertsManager> {
    var serial: number = await owner.getCaCertSerial(null);
    var ca = CertsManager.getCertFileBundle(serial);
    return new RootCaCertsManager(owner, ca, null);
  }

}

export abstract class IntermediateCaCertsManager extends CertsManager {
  protected async createCert(subject: string, certType: CertType,
    user: User, prefix: string,
    createExportable: boolean,
    withChain: boolean, bundleChainWithCert: boolean,
    subjectAltDnsNames: string[] = [], subjectAltIps: string[] = []): Promise<CertFileBundle> {
    var result: CreatePendingCertResult = await CertsManager.createPendingCertWithPrivateKey(prefix, certType, user, this.network, subject);
    var bundle: CertFileBundle = result.bundle;
    var certsDir: string = bundle.bundleDirectory;
    var serial: number = result.serial;
    var crtPath = path.join(certsDir, prefix + '.crt');

    // csr
    var csrPath: string = path.join(certsDir, prefix + '.csr');
    await Utils.createCsr(bundle.privateKeyFile, subject, csrPath);

    // v3 ext
    var v3ExtPath: string = path.join(certsDir, prefix + '.ext');
    await Utils.writeV3Ext(v3ExtPath, subjectAltDnsNames, subjectAltIps);

    // certificate
    await Utils.signCertificate(
      this.ca.privateKeyFile,
      this.ca.certificateFile,
      serial,
      csrPath,
      v3ExtPath,
      crtPath,
      365);

    // chain
    if (withChain) {
      let certificateChainFile: string = path.join(certsDir, 'chain.pem');
      await Utils.writeFile(certificateChainFile, await Utils.readFile(this.ca.certificateFile));
      if (this.ca.certificateChainFile) {
        await Utils.appendFile(certificateChainFile, await Utils.readFile(this.ca.certificateChainFile));
      }
      bundle.certificateChainFile = certificateChainFile;
    }

    if (bundleChainWithCert) {
      await Utils.appendFile(crtPath, await Utils.readFile(this.ca.certificateFile));
      if (this.ca.certificateChainFile) {
        await Utils.appendFile(crtPath, await Utils.readFile(this.ca.certificateChainFile));
      }
    }

    bundle.certificateFile = crtPath;
    var bundleConfigPath: string = path.join(bundle.bundleDirectory, 'bundle.json');
    await CertsManager.saveCertBundleConfig(bundleConfigPath, bundle);
    await result.cert.markAsActive();

    // do not write password in the bundle.json file

    if (createExportable) {
      var password: string = await createBase62Password(16);
      var clientP12Path = path.join(bundle.bundleDirectory, prefix + '.p12');
      await Utils.exportPkcs12(
        crtPath,
        bundle.privateKeyFile,
        bundle.certificateChainFile,
        password,
        clientP12Path)
      bundle.exportPkcs12File = clientP12Path;
      bundle.exportPkcs12Password = password;
    }

    return bundle;
  }

  async createClientCert(subject: string, user: User, certType: CertType, createExportable: boolean = true, bundleConfigPrefix?: string): Promise<CertFileBundle> {
    var bundle: CertFileBundle = await this.createCert(subject, certType, user, 'client', createExportable, true, false);
    if (bundleConfigPrefix) {
      await CertsManager.saveCertBundleConfig(path.join(AppConfigConstants.ConfigCertsDir, bundleConfigPrefix + '.json'), bundle);
    }
    return bundle;
  }
}

export class NetworkCertsManager extends IntermediateCaCertsManager {

  async createNetworkServerCert(subject: string, user: User): Promise<CertFileBundle> {
    return this.createCert(subject, CertType.Server, user, 'server', false, false, true);
  }

  static async getInstance(owner: User, network: Network): Promise<NetworkCertsManager> {
    var serial: number = await owner.getCaCertSerial(network);
    var ca = CertsManager.getCertFileBundle(serial);
    return new NetworkCertsManager(owner, ca, network);
  }
}

export class SiteCertsManager extends IntermediateCaCertsManager {

  async createSiteCert(subject: string, user: User, prefix: string, subjectAltDnsNames: string[], subjectAltIps: string[], bundleChainWithCert: boolean): Promise<CertFileBundle> {
    var bundle: CertFileBundle = await this.createCert(subject, CertType.Site, user, prefix, false, true, bundleChainWithCert, subjectAltDnsNames, subjectAltIps);
    await CertsManager.saveCertBundleConfig(path.join(AppConfigConstants.ConfigCertsDir, prefix + '.json'), bundle);
    return bundle;
  }

  static async getInstance(owner: User): Promise<SiteCertsManager> {
    var serial: number = await owner.getCaCertSerial(null);
    var ca = CertsManager.getCertFileBundle(serial);
    return new SiteCertsManager(owner, ca, null);
  }

  get caCertificateFile(): string {
    return this.ca.certificateFile;
  }
}
