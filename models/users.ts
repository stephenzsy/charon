import {CollectionRequest, CollectionResult} from './common';

export interface UserContext {
  username: string;
  email: string;
}

export interface UserMetadata {
  id: string;
  createdAt: Date;
}

export interface User extends UserContext, UserMetadata { }

export interface CreateUserRequest extends UserContext { }

export interface CreateUserResult extends UserMetadata { }

export interface ListUsersRequest extends CollectionRequest<number> { }

export interface ListUsersResult extends CollectionResult<User, Number> { }

export interface DeleteUserRequest {
  id: string;
}

export interface DeleteUserResult {
  deletedAt: Date;
}

export module UserErrorCodes {
  export var UserDoesNotExist: string = 'UserDoesNotExist';
}
