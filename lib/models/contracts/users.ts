export interface User {
  id?: string;
  name?: string;
  emailAddress?: string;
  createdAt?: Date;
}

export interface CreateUserRequest {
  emailAddress: string;
  name: string;
}

export interface CreateUserResult {
  id: string;
}
