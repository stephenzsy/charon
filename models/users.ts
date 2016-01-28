import {CollectionRequest, CollectionResult} from './common';
import {UserPasswordMetadata} from './secrets';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
}

export interface CreateUserResult {
  id: string;
  createdAt: Date;
}

export interface GetUserRequest {
  id: string;
  withPasswords: boolean;
}

export interface GetUserResult extends User {
  passwords?: UserPasswordMetadata[];
}

export interface ListUsersRequest extends CollectionRequest<number> { }

export interface ListUsersResult extends CollectionResult<User, Number> { }

export interface DeleteUserRequest {
  id: string;
}

export interface DeleteUserResult {
  deletedAt: Date;
}
