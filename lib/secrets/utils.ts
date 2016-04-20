///<reference path="../../typings/big-integer/big-integer.d.ts"/>
///<reference path="../../typings/q/Q.d.ts"/>

import * as crypto from 'crypto';
import * as Q from 'q';
import * as bigInt from 'big-integer';
const assert = require('assert');

const base62Encoding: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
assert(base62Encoding.length === 62);

export async function createBase62Password(length: number, lowercase: boolean = false): Promise<string> {
  var numBytes: number = length * 2;
  var buf: Buffer = await Q.nfcall<Buffer>(crypto.randomBytes, numBytes);

  var randomBigInt: BigInteger = bigInt.zero;
  for (let i: number = 0; i < numBytes; ++i) {
    randomBigInt = randomBigInt.multiply(256).add(buf[i]);
  }
  var tBuf: Buffer = new Buffer(length);
  for (let i: number = 0; i < length; ++i) {
    let result = randomBigInt.divmod(62);
    let r = result.remainder.valueOf();
    tBuf[i] = base62Encoding.charCodeAt(r);
    randomBigInt = result.quotient;
  }
  var password: string = tBuf.toString();
  if (lowercase) {
    password = password.toLowerCase();
  }
  return password;
}

export default {
  createBase62Password: createBase62Password
}
