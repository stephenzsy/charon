export interface GetTokenRequest {
  scope: string;
}

export interface GetTokenResult {
  scope: string;
  token: string;
}
