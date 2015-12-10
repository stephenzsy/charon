'use strict';

import { CaCertConfig } from './security-configs';

export interface CertBundle {
  certificatePemFile: string;
}

export class CaCert implements CertBundle {
  private config: CaCertConfig;

  constructor(config: CaCertConfig) {
    this.config = config;
  }

  get certificatePemFile(): string {
    return this.config.certificatePemFile;
  }
}