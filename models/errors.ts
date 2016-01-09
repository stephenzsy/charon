export interface UserError {
  code: string;
  message: string;
}

export module ErrorCodes {
  export module Authorization {
    export const InsufficientPrivileges: string = 'InsufficientPrivileges';
    export const InvalidToken: string = 'InvalidToken';
    export const AuthorizationRequired: string = 'AuthorizationTokenRequired';
    export const TokenExpired: string = 'TokenExpired';
  }

  export const BadRequest: string = 'BadRequest';
  export const ResourceNotFound: string = 'ResourceNotFound';
}
