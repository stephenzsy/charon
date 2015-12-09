///<reference path="../../typings/q/Q.d.ts"/>

'use strict';

import * as Q from 'q';
import * as express from 'express';
import {CaCert} from '../models/cert';
import {CaCertConfig} from '../models/certs-config';

export class CaCertManager {
  private caCertConfig: CaCertConfig;

  constructor(config: CaCertConfig) {
    this.caCertConfig = config;
  }

  get certificatePemFile(): string {
    return this.caCertConfig.certificatePemFile;
  }

  get certificateMetadata(): string {
    return this.caCertConfig.certificateMetadata;
  }
}
