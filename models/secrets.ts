export interface CreateUserPasswordRequest {
  userId: string;
  networkId: string;
}

export module UserPasswordStatus {
  export const Pending: string = 'pending';
  export const Active: string = 'active';
  export const Expired: string = 'expired';
  export const Revoked: string = 'revoked';
}

export interface UserPasswordMetadata {
  id: string;
  userId: string;
  networkId: string;
  validTo: Date;
}

export interface CreateUserPasswordResult extends UserPasswordMetadata {
  password: string;
}

export interface GetUserPasswordsRequest {
  userId: string;
  networkId?: string;
}

export type GetUserPasswordsResult = UserPasswordMetadata[];

export interface DeleteUserPasswordRequest {
  id: string;
}
