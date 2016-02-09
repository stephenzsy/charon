///<reference path="../../typings/big-integer/big-integer.d.ts"/>
///<reference path="../../typings/q/Q.d.ts"/>

import * as child_process from 'child_process';
import * as Q from 'q';
import * as path from 'path';

import {CertSubjectConfig} from '../../lib/models/certs';

export function createPrivateKey(keyOutputPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    child_process.execFile('openssl', ['ecparam',
      '-out', keyOutputPath,
      '-name', 'secp384r1',
      '-genkey'
    ], (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

export function createCsr(privateKeyPath: string, subject: string, csrOutputPath): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    child_process.execFile('openssl', ['req',
      '-new',
      '-nodes',
      '-out', csrOutputPath,
      '-key', privateKeyPath,
      '-subj', subject
    ], (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

export function signCertificate(
  caPrivateKeyInputPath: string,
  caCertificateInputPath: string,
  serial: number,
  csrInputPath: string,
  crtOutputPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    child_process.execFile('openssl', ['x509',
      '-req',
      '-in', csrInputPath,
      '-out', crtOutputPath,
      '-set_serial', serial.toString(),
      '-CAkey', caPrivateKeyInputPath,
      '-sha384',
      '-CA', caCertificateInputPath,
      '-days', '365'
    ], (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

export function exportPkcs12(
  crtInputPath: string,
  keyInputPath: string,
  caCertInputPath: string,
  passout: string,
  p12OutputPath: string): Q.Promise<void> {
  return Q.nfcall<void>(child_process.execFile, 'openssl', ['pkcs12',
    '-export',
    '-chain',
    '-in', crtInputPath,
    '-inkey', keyInputPath,
    '-out', p12OutputPath,
    '-CAfile', caCertInputPath,
    '-passout', 'pass:' + passout]);
}

export function getSubject(config: CertSubjectConfig): string {
  var subj: string = '';
  if (config.country) {
    subj += '/C=' + config.country.trim();
  }
  if (config.stateOrProviceName) {
    subj += '/ST=' + config.stateOrProviceName.trim()
  }
  if (config.localityName) {
    subj += '/L=' + config.localityName.trim();
  }
  if (config.organizationName) {
    subj += '/O=' + config.organizationName.trim();
  }
  if (config.organizationUnitName) {
    subj += '/OU=' + config.organizationUnitName.trim();
  }
  if (config.commonName) {
    subj += '/CN=' + config.commonName.trim();
  }
  if (config.emailAddress) {
    subj += '/emailAddress=' + config.emailAddress.trim();
  }
  return subj;
}
