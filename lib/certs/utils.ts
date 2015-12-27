import * as child_process from 'child_process';
import * as Q from 'q';

export function createPrivateKey(): Q.Promise<string> {
  return Q.nfcall(child_process.execFile, 'openssl', [
    'ecparam',
    '-name', 'secp384r1',
    '-genkey'])
    .then((stdout: Buffer): string  => {
    return stdout.toString()
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
  return Q.nfcall(child_process.execFileSync, 'openssl', [
    'req',
    '-new',
    '-x509',
    '-extensions', 'v3_ca',
    //'-key', configCertsCaKeyPem,
    //'-out', configCertsCaCertPem,
    '-subj', subject,
    '-days', '365'])
    .then((stdout: Buffer): string => {
    return stdout.toString();
  });
}
