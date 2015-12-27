
export interface GetCaRequest {
}

export interface GetCaResult {
  rawCertificateMetadata: string;
  certificatePemContent: string;
}

export interface CreateClientKeypairRequest {
  emailAddress: string;
}

export interface CreateClientKeypairResult {
  publicKeyPemContent: string;
  privateKeyPemContent: string;
}

export module CertFormat {
  export const MetadataJson: string = 'json';
  export const Pem: string = 'pem';
}
