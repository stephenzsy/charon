
export interface GetCaRequest {
  format: string;
}

export interface GetCaResult {
  rawCertificateMetadata: string;
  /**
   * pem path
   */
  _certificatePemPath?: string;
}

export interface CreateClientKeypairRequest {
}

export interface CreateClientKeypairResult {
  publicKeyPemContent: string;
  privateKeyPemContent: string;
}

export module CertFormat {
  export const MetadataJson: string = 'json';
  export const Pem: string = 'pem';
}
