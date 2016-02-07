/// <reference path="../../../typings/validator/validator.d.ts" />
'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as validator from 'validator';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import { User as IUser,
CreateUserRequest, CreateUserResult,
GetUserRequest, GetUserResult,
ListUsersRequest, ListUsersResult,
DeleteUserRequest, DeleteUserResult} from '../../../models/users';
import {CollectionQueryResult} from '../../../lib/models/common';
import {User} from '../../../lib/models/users';
import {Password} from '../../../lib/models/passwords';

import {BadRequestError, ConflictResourceError, ResourceNotFoundError} from '../../../lib/models/errors';
import {RequestValidations} from '../../../lib/validations';
import {UserPasswordMetadata} from '../../../models/secrets';

async function getUserPasswords(user: User): Promise<UserPasswordMetadata[]> {
  var passwords: Password[] = await Password.find(user, null);
  return passwords.map((password: Password): UserPasswordMetadata => {
    return {
      id: password.id,
      userId: user.id,
      networkId: password.networkId,
      validTo: password.validTo
    }
  });
}

class ListUsersEnactor extends ActionEnactor<ListUsersRequest, ListUsersResult> {
  async enactAsync(req: ListUsersRequest): Promise<ListUsersResult> {
    return User.findAndCountAllActive({ limit: req.limit })
      .then((result: CollectionQueryResult<User, number>): ListUsersResult => {
      return {
        count: result.count,
        items: result.items.map((user: User): IUser => {
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
          };
        })
      };
    });
  }
}

class CreateUserEnactor extends ActionEnactor<CreateUserRequest, CreateUserResult>{
  async enactAsync(req: CreateUserRequest): Promise<CreateUserResult> {
    return User.findByUserName(req.username)
      .then((user: User): Promise<User> => {
      if (user) {
        throw new ConflictResourceError('User with name "' + req.username + '" already exists.');
      }
      return User.create(req);
    }).then((user: User): CreateUserResult => {
      return {
        id: user.id,
        createdAt: user.createdAt
      };
    });
  }
}

class DeleteUserEnactor extends ActionEnactor<DeleteUserRequest, DeleteUserResult> {
  enactAsync(req: DeleteUserRequest): Promise<DeleteUserResult> {
    return resolveUser(req.id)
      .then((user: User): Q.Promise<void> => {
      return user.delete();
    })
      .then((): DeleteUserResult => {
      return {
        deletedAt: new Date()
      }
    });
  }
}

class GetUserEnactor extends ActionEnactor<GetUserRequest, GetUserResult> {
  async  enactAsync(req: GetUserRequest): Promise<GetUserResult> {
    var user: User = await resolveUser(req.id);
    var result: GetUserResult = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    }
    if (req.withPasswords) {
      result.passwords = await getUserPasswords(user);
    }
    return result;
  }
}

export async function resolveUser(userId: string): Promise<User> {
  return User.findById(userId)
    .then((user: User): User => {
    if (!user) {
      throw new ResourceNotFoundError('User with ID: ' + userId + ' does not exist');
    }
    return user;
  });
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

  export const getUserHandler: express.RequestHandler = HandlerUtils.newRequestHandler<GetUserRequest, GetUserResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): GetUserRequest => {
      var id: string = req.params['id'];
      RequestValidations.validateUUID(id, 'id');
      var withPasswords: boolean = validator.toBoolean(req.query['withPasswords']);
      return {
        id: id,
        withPasswords: withPasswords
      };
    },
    enactor: new GetUserEnactor()
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

  export const deleteUserHandler: express.RequestHandler = HandlerUtils.newRequestHandler<DeleteUserRequest, DeleteUserResult>({
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
