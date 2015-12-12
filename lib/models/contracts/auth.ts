export interface GetTokenRequest {
  scope: string;
}

export interface GetTokenResult {
  scope: string;
  token: string;
}

export module TokenScope {
  export const Public: string = 'public';
  export const Admin: string = 'admin';
}
