/// <reference path="../../../typings/validator/validator.d.ts" />
'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as validator from 'validator';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {CreateUserRequest, CreateUserResult, ListUsersRequest, ListUsersResult, DeleteUserRequest, DeleteUserResult} from '../../../models/users';
import {User} from '../../../lib/models/users';
import {BadRequestError} from '../../../lib/models/errors';
import {RequestValidations} from '../../../lib/validations';

class ListUsersEnactor extends ActionEnactor<ListUsersRequest, ListUsersResult> {
  enactAsync(req: ListUsersRequest): Q.Promise<ListUsersResult> {
    return User.findAndCountAllActive({ limit: req.limit });
  }
}

class CreateUserEnactor extends ActionEnactor<CreateUserRequest, CreateUserResult>{
  enactAsync(req: CreateUserRequest): Q.Promise<CreateUserResult> {
    return User.create(req);
  }
}

class DeleteUserEnactor extends ActionEnactor<DeleteUserRequest, DeleteUserResult> {
  enactAsync(req: DeleteUserRequest): Q.Promise<DeleteUserResult> {
    return User.delete(req.id);
  }
}

export module Handlers {
  export const createUserHandler: express.RequestHandler = HandlerUtils.newRequestHandler<CreateUserRequest, CreateUserResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): CreateUserRequest => {
      var email: string = req.body['email'];
      RequestValidations.validateIsLength(email, 'email', 1, 256);
      RequestValidations.validateIsEmail(email, 'email');

      var username: string = req.body['username'];
      RequestValidations.validateIsLength(username, 'username', 1, 256);
      if (!validator.isAlphanumeric(username)) {
        throw new BadRequestError('Name must be alpha numeric');
      }
      return {
        username: username,
        email: email
      };
    },
    enactor: new CreateUserEnactor()
  });

  export const listUsersHandler: express.RequestHandler = HandlerUtils.newRequestHandler<ListUsersRequest, ListUsersResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): ListUsersRequest => {
      var _limit: string = req.query['limit'];
      var limit: number = RequestValidations.validateIsIntWithDefault(_limit, 'limit', 1, 500, 10);
      return {
        limit: limit
      };
    },
    enactor: new ListUsersEnactor()
  });

  export const deleteuserHandler: express.RequestHandler = HandlerUtils.newRequestHandler<DeleteUserRequest, DeleteUserResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): DeleteUserRequest => {
      var id: string = req.params['id'];
      RequestValidations.validateUUID(id, 'id');
      return {
        id: id
      };
    },
    enactor: new DeleteUserEnactor()
  });
}
