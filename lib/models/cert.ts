'use strict';

import { CertConfig } from './security-configs';

export class CertBundle {
  private _certificatePemFile: string;
  private _certificatePemContent: string;
  private _certificateMetadata: string;
  private _privateKeyPemFile: string;

  constructor(config: CertConfig) {
    this._certificatePemFile = config.certificatePemFile;
    this._certificatePemContent = config.certificatePemContent;
    this._certificateMetadata = config.certificateMetadata;
    this._privateKeyPemFile = config.privateKeyPemFile;
  }

  public get certificateMetadata(): string {
    return this._certificateMetadata;
  }

  public get certificatePemFile() : string {
    return this._certificatePemFile;
  }

  public get certificatePemContent() : string {
    return this._certificatePemContent;
  }

  protected get privateKeyPemFile(): string {
    return this._privateKeyPemFile;
  }
}
