/// <reference path="../../../typings/validator/validator.d.ts" />
'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as validator from 'validator';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {CreateUserRequest, CreateUserResult} from '../../../lib/models/contracts/users';
import {User} from '../../../lib/models/users';
import {BadRequestError} from '../../../lib/models/errors';

class CreateUserEnactor extends ActionEnactor<CreateUserRequest, CreateUserResult>{
  enactAsync(req: CreateUserRequest): Q.Promise<CreateUserResult> {
    return User.create(req);
  }
}

export module Handlers {
  export const createUserHandler: express.RequestHandler = HandlerUtils.newRequestHandler<CreateUserRequest, CreateUserResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): CreateUserRequest => {

      var email: string = req.body['email'];
      if (!validator.isLength(email, 1, 256)) {
        throw new BadRequestError('Email must be between 1 and 256 characters');
      }
      if (!validator.isEmail(email)) {
        throw new BadRequestError('A valid email address is required to create a client key pair.');
      }

      var name: string = req.body['name'];
      if (!validator.isLength(name, 1, 256)) {
        throw new BadRequestError('Name must be between 1 and 256 characters');
      }
      if (!validator.isAlphanumeric(name)) {
        throw new BadRequestError('Name must be alpha numeric');
      }
      return {
        name: name,
        email: email
      };
    },
    enactor: new CreateUserEnactor()
  });
}
