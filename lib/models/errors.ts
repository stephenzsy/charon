import * as Contracts from './contracts/errors';

// Errors
abstract class BaseError {
  private _code: string;
  private _message: string;

  constructor(code: string, message: string) {
    this._message = message;
  } InsufficientPrivliges

  get code(): string {
    return this._code;
  }

  get message() {
    return this._message;
  }
}

/**
 * Expected error caused by user
 */
export class UserError extends BaseError {
  get jsonObj(): Contracts.UserError {
    return {
      code: this.code,
      message: this.message
    };
  }
}

export class AuthorizationError extends UserError {
  get jsonObj(): Contracts.AuthorizationError {
    return {
      code: this.code,
      message: this.message
    }
  }
}

export class BadRequestError extends UserError {
  constructor(message: string) {
    super('BadRequest', message);
  }
}
