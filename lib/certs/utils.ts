import * as child_process from 'child_process';
import * as Q from 'q';
import * as path from 'path';

import {CertSubjectConfig} from '../../lib/models/cert';

export function createPrivateKey(keyOutputPath: string): Q.Promise<void> {
  return Q.nfcall<void>(child_process.execFile, 'openssl', [
    'ecparam',
    '-out', keyOutputPath,
    '-name', 'secp384r1',
    '-genkey']);
}

export function createCsr(privateKeyPath: string, subject: string, csrOutputPath): Q.Promise<void> {
  return Q.nfcall<void>(child_process.execFile, 'openssl', [
    'req',
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
  return Q.nfcall<void>(child_process.execFile, 'openssl', [
    'x509',
    '-req',
    '-in', csrInputPath,
    '-out', crtOutputPath,
    '-set_serial', serial,
    '-CAkey', caPrivateKeyInputPath,
    '-sha384',
    '-CA', caCertificateInputPath,
    '-days', '365']);
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
