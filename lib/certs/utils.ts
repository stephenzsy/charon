///<reference path="../../typings/big-integer/big-integer.d.ts"/>
///<reference path="../../typings/q/Q.d.ts"/>

import * as child_process from 'child_process';
import * as Q from 'q';
import * as path from 'path';
import * as crypto from 'crypto';
import * as bigInt from 'big-integer'

import {CertSubjectConfig} from '../../lib/models/cert';

export function createPrivateKey(keyOutputPath: string): Q.Promise<void> {
  return Q.nfcall<void>(child_process.execFile, 'openssl', ['ecparam',
    '-out', keyOutputPath,
    '-name', 'secp384r1',
    '-genkey']);
}

export function createCsr(privateKeyPath: string, subject: string, csrOutputPath): Q.Promise<void> {
  return Q.nfcall<void>(child_process.execFile, 'openssl', ['req',
    '-new',
    '-nodes',
    '-out', csrOutputPath,
    '-key', privateKeyPath,
    '-subj', subject]);
}

export function signClientCertificate(
  caPrivateKeyInputPath: string,
  caCertificateInputPath: string,
  serial: number,
  csrInputPath: string,
  crtOutputPath: string): Q.Promise<void> {
  return Q.nfcall<void>(child_process.execFile, 'openssl', ['x509',
    '-req',
    '-in', csrInputPath,
    '-out', crtOutputPath,
    '-set_serial', serial,
    '-CAkey', caPrivateKeyInputPath,
    '-sha384',
    '-CA', caCertificateInputPath,
    '-days', '365']);
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

const base36Encoding: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function createBase36Password(length: number, lowercase: boolean = false): Q.Promise<string> {
  var numBytes: number = length * 2;
  return Q.nfcall(crypto.randomBytes, numBytes).then((buf: Buffer): string => {
    var randomBigInt: BigInteger = bigInt.zero;
    for (let i: number = 0; i < numBytes; ++i) {
      randomBigInt = randomBigInt.multiply(256).add(buf[i]);
    }
    var tBuf: Buffer = new Buffer(length);
    for (let i: number = 0; i < length; ++i) {
      let result = randomBigInt.divmod(36);
      let r = result.remainder.valueOf();
      tBuf[i] = base36Encoding.charCodeAt(r);
      randomBigInt = result.quotient;
    }
    var password: string = tBuf.toString();
    if (lowercase) {
      password = password.toLowerCase();
    }
    return password;
  });
}
