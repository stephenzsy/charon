export interface CertConfig {
  certificatePemContent: string;
  certificateMetadata: string;
  certificatePemFile: string;
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