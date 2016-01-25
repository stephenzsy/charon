export module TokenScope {
  export const Public: string = 'public';
  export const Admin: string = 'admin';
}

export interface AuthToken {
  scope: string;
  token: string;
  expiry: Date;
}

export interface GetTokenRequest {
  scope: string;
}

export type GetTokenResult = AuthToken;
