/// <reference path="../../../typings/validator/validator.d.ts" />
'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as validator from 'validator';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {CreateUserPasswordRequest, CreateUserPasswordResult, UserPasswordStatus,
  GetUserPasswordsRequest, GetUserPasswordsResult, UserPasswordMetadata} from '../../../models/secrets';
import {User} from '../../../lib/models/users';
import {Network} from '../../../lib/models/networks';
import {Password} from '../../../lib/models/password';
import {resolveUser} from '../users/users';
import {resolveNetwork} from '../networks/networks';

import {BadRequestError} from '../../../lib/models/errors';
import {RequestValidations} from '../../../lib/validations';

export async function getUserPasswords(user: User, network?: Network): Promise<UserPasswordMetadata[]> {
  var passwords: Password[] = await Password.find(user, network);
  return passwords.map((password: Password): UserPasswordMetadata => {
    return {
      id: password.id,
      userId: user.id,
      networkId: password.networkId,
      validTo: password.validTo
    }
  });
}

class GetUserPasswordsEnactor extends ActionEnactor<GetUserPasswordsRequest, GetUserPasswordsResult> {
  async enactAsync(req: GetUserPasswordsRequest): Promise<GetUserPasswordsResult> {
    var network: Network = null;
    if (req.networkId) {
      network = resolveNetwork(req.networkId);
    }
    var user: User = await resolveUser(req.userId);
    return getUserPasswords(user, network);
  }
}

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

  export const getUserPasswordsHandler: express.RequestHandler = HandlerUtils.newRequestHandler<GetUserPasswordsRequest, GetUserPasswordsResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): GetUserPasswordsRequest => {
      var userId: string = req.params['userId'];
      RequestValidations.validateUUID(userId, 'userId');

      var networkId: string = req.query['networkId'];
      if (networkId) {
        RequestValidations.validateUUID(networkId, 'networkId');
      }

      return {
        userId: userId,
        networkId: networkId
      };
    },
    enactor: new GetUserPasswordsEnactor()
  });
}
