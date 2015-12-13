import * as Contracts from './contracts/errors';

// Errors
abstract class BaseError {
  private _message: string;

  constructor(message: string) {
    this._message = message;
  } InsufficientPrivliges

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
      message: this.message
    };
  }
}

export class AuthorizationError extends UserError {
  private _code: string;

  constructor(code: string, message: string) {
    super(message);
    this._code = code;
  }

  get code(): string {
    return this._code;
  }

  get jsonObj(): Contracts.AuthorizationError {
    return {
      code: this.code,
      message: this.message
    }
  }
}

export class BadRequestError extends UserError {

}
