export interface CaCertConfig {
  certificatePemFile: string;
  certificateMetadata: string;
}

export interface AuthTokenConfig {
  algorithm: string;
  privateKey: string;
  publicKey: string;
}

export interface TokenContext {
  scope: string;
}
