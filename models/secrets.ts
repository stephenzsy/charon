export interface CreateUserPasswordRequest {
  userId: string;
}

export module UserPasswordStatus {
  export const Active: string = 'active';
  export const Expired: string = 'expired';
  export const Revoked: string = 'revoked';
}

export interface CreateUserPasswordResult {
  /**
   * Password ID
   */
  id: string;
  validFrom: Date;
  validTo: Date;
  status: string;
}
