export interface UserContext {
  name: string;
  email: string;
}

export interface UserMetadata {
  id: string;
  createdAt: Date;
}

export interface User extends UserContext, UserMetadata {
}

export interface CreateUserRequest extends UserContext {
}

export interface CreateUserResult extends UserMetadata {
}

export interface ListUsersRequest {

}

export interface ListusersResult {
  
}
