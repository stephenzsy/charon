import * as path from 'path';

import User from '../models/users';
import {CertFileBundle, CertType} from '../models/certs';
import {CertsManager, CreatePendingCertResult} from './certs-manager';
import * as Utils from './utils';
import {Constants as AppConfigConstants} from '../config/config';
import {Network} from '../models/networks';

const PathRootCaBundleConfig = path.join(AppConfigConstants.ConfigCertsDir, 'root-ca.json');

export class IntermediateCaManager extends CertsManager {
  get rootCaBundle(): CertFileBundle {
    return require(PathRootCaBundleConfig);
  }

  async createCaCert(user: User, network: Network, subject: string): Promise<CertFileBundle> {
    var prefix: string = 'ca';
    var result: CreatePendingCertResult = await this.createPendingCertWithPrivateKey(prefix, CertType.CA, user, network, subject);
    var bundle: CertFileBundle = result.bundle;
    var certsDir: string = bundle.bundleDirectory;
    var serial: number = result.serial;
    var crtPath = path.join(certsDir, prefix + '.crt');
    // csr
    var csrPath: string = path.join(certsDir, prefix + '.csr');
    await Utils.createCsr(bundle.privateKeyFile, subject, csrPath);
    var caFileBundle: CertFileBundle = this.rootCaBundle;
    var hexSerial:string = serial.toString(16).toUpperCase();

    await Utils.writeFile(path.join(caFileBundle.bundleDirectory, 'serial'), hexSerial);
    await Utils.writeFile(path.join(caFileBundle.bundleDirectory, 'index.txt'), '');
    await Utils.writeFile(path.join(caFileBundle.bundleDirectory, 'index.txt.attr'), '');

    // certificate
    await Utils.signIntermediateCa(
      caFileBundle.bundleDirectory,
      caFileBundle.privateKeyFile,
      caFileBundle.certificateFile,
      serial,
      csrPath,
      certsDir,
      730);

    await Utils.rename(path.join(certsDir, hexSerial + '.pem'), crtPath);

    // chain
    var certificateChainFile: string = path.join(certsDir, 'chain.pem');
    var certContent: string = await Utils.readFile(caFileBundle.certificateFile);
    await Utils.writeFile(certificateChainFile, certContent);

    bundle.certificateFile = crtPath;
    bundle.certificateChainFile = certificateChainFile;
    var bundleConfigPath: string = path.join(bundle.bundleDirectory, 'bundle.json');
    await this.saveCertBundleConfig(bundleConfigPath, bundle);
    await result.cert.markAsActive();
    return bundle;
  }
}

export class RootCaManager extends CertsManager {
  async createRootCaCert(subject: string, user: User): Promise<CertFileBundle> {
    var result: CreatePendingCertResult = await this.createPendingCertWithPrivateKey('ca', CertType.CA, user, null, subject);
    var bundle: CertFileBundle = result.bundle;
    bundle.certificateFile = path.join(bundle.bundleDirectory, 'ca.crt');
    await Utils.createRootCaCert(bundle.privateKeyFile, bundle.certificateFile, result.serial, subject);
    await this.saveCertBundleConfig(path.join(bundle.bundleDirectory, 'bundle.json'), bundle);
    await this.saveCertBundleConfig(PathRootCaBundleConfig, bundle);
    await result.cert.markAsActive();
    return bundle;
  }
}

export const rootCaManager = new RootCaManager();
export const intermediateCaManager = new IntermediateCaManager();
