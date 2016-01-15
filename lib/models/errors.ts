import * as Contracts from '../../models/errors';

// Errors
abstract class BaseError {
  private _code: string;
  private _message: string;

  constructor(code: string, message: string) {
    this._code = code;
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
}

export class ResourceNotFoundError extends UserError {
  constructor(message: string) {
    super(Contracts.ErrorCodes.ResourceNotFound, message);
  }
}

export class ConflictResourceError extends UserError {
  constructor(message: string) {
    super(Contracts.ErrorCodes.ConflictResource, message);
  }
}

export class BadRequestError extends UserError {
  constructor(message: string) {
    super(Contracts.ErrorCodes.BadRequest, message);
  }
}
