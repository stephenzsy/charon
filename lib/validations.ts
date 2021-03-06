///<reference path="../typings/validator/validator.d.ts"/>

import * as validator from 'validator';
import {ErrorCodes} from '../models/errors';
import {BadRequestError} from './models/errors';

export module RequestValidations {
  export function validateIsLength(input: string, fieldName: string, min: number, max: number) {
    if (!validator.isLength(input, min, max)) {
      throw new BadRequestError('Input parameter "' + fieldName + '" must be between ' + min + ' and ' + max + ' characters');
    }
  }

  export function validateIsEmail(input: string, fieldName: string) {
    if (!validator.isEmail(input)) {
      throw new BadRequestError('A valid email address is required for input parameter "' + fieldName + '".', ErrorCodes.Users.Create.InvalidEmail);
    }
  }

  export function validateIsIntWithDefault(input: string, fieldName: string, min: number, max: number, defaultValue: number): number {
    if (!input) {
      return defaultValue;
    }
    if (!validator.isInt(input)) {
      throw new BadRequestError('Input parameter "' + fieldName + '" must be an integer.');
    }
    var value: number = validator.toInt(input);
    if (value < min || value > max) {
      throw new BadRequestError('Input parameter "' + fieldName + '" must be between ' + min + ' and ' + max + '.');
    }
    return value;
  }

  export function validateUUID(input: string, fieldName: string): string {
    if (!validator.isUUID(input)) {
      throw new BadRequestError('Input parameter "' + fieldName + '" must be a valid UUID.');
    }
    return input;
  }

  export function validateIsIn(fieldName: string, input: string, expectedIn: string[]): string {
    if (!validator.isIn(input, expectedIn)) {
      throw new BadRequestError('Input parameter "' + fieldName + '" must be one of [ ' + expectedIn.join(', ') + ' ]');
    }
    return input;
  }
}
