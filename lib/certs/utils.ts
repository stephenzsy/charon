///<reference path="../../typings/big-integer/big-integer.d.ts"/>
///<reference path="../../typings/q/Q.d.ts"/>

import * as child_process from 'child_process';
import * as Q from 'q';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
import {Constants as AppConfigConstants} from '../config/config'

export function createPrivateKey(keyOutputPath: string): Promise<void> {
  return execFile('openssl', ['ecparam',
    '-out', keyOutputPath,
    '-name', 'secp384r1',
    '-genkey'
  ]);
}

export function createCsr(privateKeyPath: string, subject: string, csrOutputPath): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    var params: string[] = ['req',
      '-new',
      '-sha384',
      '-nodes',
      '-out', csrOutputPath,
      '-key', privateKeyPath,
      '-subj', subject
    ];
    child_process.execFile('openssl', params, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

export function signIntermediateCa(
  caBundleDir: string,
  caPrivateKeyInputPath: string,
  caCertificateInputPath: string,
  serial: number,
  csrInputPath: string,
  certOutputDir: string,
  days: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    var params: string[] = ['ca',
      '-batch',
      '-in', csrInputPath,
      '-outdir', certOutputDir,
      '-md', 'sha384',
      '-config', AppConfigConstants.CertsCnfRootCa,
      '-extensions', 'v3_ca',
      '-notext',
      '-keyfile', caPrivateKeyInputPath,
      '-cert', caCertificateInputPath,
      '-days', days.toString()
    ];

    console.log(params.join(" "));
    console.log(caBundleDir);
    child_process.execFile('openssl', params, {
      cwd: caBundleDir
    }, (err, stdout, stderr) => {
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
  extfile: string,
  crtOutputPath: string,
  days: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    var params: string[] = ['x509',
      '-req',
      '-in', csrInputPath,
      '-out', crtOutputPath,
      '-set_serial', serial.toString(),
      '-CAkey', caPrivateKeyInputPath,
      '-sha384',
      '-extfile', extfile,
      '-extensions', 'v3_req',
      '-CA', caCertificateInputPath,
      '-days', days.toString()
    ];
    child_process.execFile('openssl', params, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

async function execFile(command: string, args?: string[]): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    child_process.execFile(command, args, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fsExtra.writeFile(path, content, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export async function appendFile(path: string, content: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fsExtra.appendFile(path, content, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export async function readFile(path: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    fsExtra.readFile(path, null, (err, data: string) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

export async function rename(src: string, dst: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    fsExtra.rename(src, dst, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

export async function mkdirp(dir: string): Promise<void> {
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


export async function createRootCaCert(privateKeyPath: string, certificatePath: string, serial: number, subject: string): Promise<void> {
  return execFile('openssl', [
    'req',
    '-new',
    '-x509',
    '-extensions', 'v3_ca',
    '-set_serial', serial.toString(),
    '-key', privateKeyPath,
    '-out', certificatePath,
    '-sha384',
    '-subj', subject,
    '-days', '3650']);
}

export async function exportPkcs12(
  crtInputPath: string,
  keyInputPath: string,
  caCertInputPath: string,
  passout: string,
  p12OutputPath: string): Promise<void> {
  return execFile('openssl', ['pkcs12',
    '-export',
    '-chain',
    '-in', crtInputPath,
    '-inkey', keyInputPath,
    '-out', p12OutputPath,
    '-CAfile', caCertInputPath,
    '-passout', 'pass:' + passout]);
}

export async function writeV3Ext(path: string, subjectAltDnsNames: string[], subjectAltIps: string[]) {
  var lines: string[] = [
    '[ v3_req ]',
    'subjectKeyIdentifier = hash',
    'authorityKeyIdentifier	= keyid,issuer',
    'basicConstraints	= CA:false'
  ];
  if (subjectAltDnsNames.length > 0 || subjectAltIps.length > 0) {
    lines = lines.concat([
      'subjectAltName = @alt_names',
      '',
      '[ alt_names ]'
    ]);
  }
  {
    let counter: number = 0;
    subjectAltDnsNames.forEach(dnsName => {
      ++counter;
      lines.push('DNS.' + counter + ' = ' + dnsName);
    });
  }
  {
    let counter: number = 0;
    subjectAltIps.forEach(ip => {
      ++counter;
      lines.push('IP.' + counter + ' = ' + ip);
    });
  }
  return writeFile(path, lines.join("\n"));
}
