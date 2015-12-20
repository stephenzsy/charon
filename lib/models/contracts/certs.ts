
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

export module CertFormat {
  export const MetadataJson: string = 'json';
  export const Pem: string = 'pem';
}
