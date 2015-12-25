export interface CertConfig {
  certificatePemFile: string;
  certificateMetadata: string;
  privateKeyPemFile: string;
}

export interface AuthTokenConfig {
  algorithm: string;
  privateKey: string;
  publicKey: string;
}

export interface TokenContext {
  scope: string;
}
