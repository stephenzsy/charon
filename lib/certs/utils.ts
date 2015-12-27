import * as child_process from 'child_process';
import * as Q from 'q';

import {CertSubjectConfig} from '../../lib/models/cert';

export function createPrivateKey(): Q.Promise<string> {
  return Q.nfcall(child_process.execFile, 'openssl', [
    'ecparam',
    '-name', 'secp384r1',
    '-genkey'])
    .then((stdout: Buffer): string  => {
    return stdout.toString();
  });
}

export function createPrivateKeyFile(keyOutputPath: string): Q.Promise<void> {
  return Q.nfcall<void>(child_process.execFile, 'openssl', [
    'ecparam',
    '-out', keyOutputPath,
    '-name', 'secp384r1',
    '-genkey']);
}

export function createX509Csr(privateKey: string, subject: string): Q.Promise<string> {
  var deferred: Q.Deferred<string> = Q.defer<string>();
  var cp: child_process.ChildProcess = child_process.execFile('openssl', [
    'req',
    '-new',
    '-x509',
    '-nodes',
    '-key', '/dev/stdin',
    '-subj', subject,
    '-days', '365'],
    (error, stdout, stderr) => {
      if (error) {
        deferred.reject(error);
        console.error(stderr.toString());
        return;
      }
      deferred.resolve(stdout.toString());
    });
  cp.stdin.write(privateKey);
  cp.stdin.end();
  return deferred.promise;
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
