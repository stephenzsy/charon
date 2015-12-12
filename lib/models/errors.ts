
// Errors
abstract class BaseError {
  private _message: string;

  constructor(message: string) {
    this._message = message;
  }

  get message() {
    return this._message;
  }
}

/**
 * Expected error caused by user
 */
export class UserError extends BaseError {
  get jsonObj() {
    return {
      message: this.message
    };
  }
}

export class BadRequestError extends UserError {

}
