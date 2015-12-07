///<reference path="../../typings/q/Q.d.ts"/>

'use strict';

import * as Q from 'q';
import * as express from 'express';
import {CaCert} from '../models/cert';
import {CaCertConfig} from '../models/certs-config';

export class CaCertManager {
  private caCert: CaCert;

  constructor(config: CaCertConfig) {
    this.caCert = new CaCert(config);
  }

  get certPath(): string {
    return this.caCert.certificatePemFile;
  }
}
