export interface UserError {
  message: string;
}

export module ErrorCodes {
  export module Authorization {
    export var InsufficientPrivileges: string = 'InsufficientPrivileges';
    export var InvalidToken: string = 'InvalidToken';
    export var AuthorizationRequired: string = 'AuthorizationTokenRequired';
  }
}

export interface AuthorizationError extends UserError {
  code: string;
}
