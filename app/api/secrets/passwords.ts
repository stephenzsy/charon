/// <reference path="../../../typings/validator/validator.d.ts" />
'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as validator from 'validator';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {CreateUserPasswordRequest, CreateUserPasswordResult, UserPasswordStatus,
  GetUserPasswordsRequest, GetUserPasswordsResult, UserPasswordMetadata,
  DeleteUserPasswordRequest} from '../../../models/secrets';
import {User} from '../../../lib/models/users';
import {Network} from '../../../lib/models/networks';
import {Password} from '../../../lib/models/password';
import {resolveUser} from '../users/users';
import {resolveNetwork} from '../networks/networks';

import {BadRequestError} from '../../../lib/models/errors';
import {RequestValidations} from '../../../lib/validations';

class CreateUserPasswordEnactor extends ActionEnactor<CreateUserPasswordRequest, CreateUserPasswordResult>{
  async enactAsync(req: CreateUserPasswordRequest): Promise<CreateUserPasswordResult> {
    var network: Network = resolveNetwork(req.networkId);
    return resolveUser(req.userId)
      .then((user: User): Promise<Password> => {
        return Password.create(user, network);
      })
      .then((password: Password): CreateUserPasswordResult => {
        var timestamp: Date = new Date();
        var status: string = UserPasswordStatus.Active;
        if (timestamp > password.validTo) {
          status = UserPasswordStatus.Expired;
        }
        return {
          id: password.id,
          userId: req.userId,
          networkId: req.networkId,
          validTo: password.validTo,
          password: password.password
        };
      });
  }
}

class DeleteUserPasswordEnactor extends ActionEnactor<DeleteUserPasswordRequest, void> {
  async enactAsync(req: DeleteUserPasswordRequest): Promise<void> {
    await Password.deleteById(req.id);
  }
}

export module Handlers {
  export const createUserPasswordHandler: express.RequestHandler = HandlerUtils.newRequestHandler<CreateUserPasswordRequest, CreateUserPasswordResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): CreateUserPasswordRequest => {
      var userId: string = req.body['userId'];
      RequestValidations.validateUUID(userId, 'userId');

      var networkId: string = req.body['networkId'];
      RequestValidations.validateUUID(networkId, 'networkId');

      return {
        userId: userId,
        networkId: networkId
      };
    },
    enactor: new CreateUserPasswordEnactor()
  });

  export const deleteUswerPasswordHandler: express.RequestHandler = HandlerUtils.newRequestHandler<DeleteUserPasswordRequest, void>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): DeleteUserPasswordRequest => {
      var passwordId: string = req.params['id'];
      RequestValidations.validateUUID(passwordId, 'userId');

      return {
        id: passwordId
      };
    },
    enactor: new DeleteUserPasswordEnactor()
  });
}
