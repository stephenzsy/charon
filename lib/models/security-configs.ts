export interface CaCertConfig {
  certificatePemFile: string;
  certificateMetadata: string;
}

export interface AuthTokenConfig {
  algorithm: string;
  privateKey: string;
  publicKey: string;
}

export module TokenScope {
  export const Public: string = 'public';
  export const Admin: string = 'admin';
}

export interface TokenContext {
  scope: string;
}
