/// <reference path="../../../typings/validator/validator.d.ts" />
'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as validator from 'validator';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {CreateUserPasswordRequest, CreateUserPasswordResult, UserPasswordStatus} from '../../../models/secrets';
import {User} from '../../../lib/models/user';
import {Password} from '../../../lib/models/password';
import {resolveUser} from '../users/users';

import {BadRequestError} from '../../../lib/models/errors';
import {RequestValidations} from '../../../lib/validations';

class CreateuserPasswordEnactor extends ActionEnactor<CreateUserPasswordRequest, CreateUserPasswordResult>{
  async enactAsync(req: CreateUserPasswordRequest): Promise<CreateUserPasswordResult> {
    return resolveUser(req.userId)
      .then((user: User): Promise<Password> => {
      return Password.create(user, req.networkId);
    })
      .then((password: Password): CreateUserPasswordResult => {
      var timestamp: Date = new Date();
      var status: string = UserPasswordStatus.Active;
      if (timestamp > password.validTo) {
        status = UserPasswordStatus.Expired;
      }
      return {
        id: password.id,
        validTo: password.validTo,
        status: status
      };
    });
  }
}

export module Handlers {
  export const createUserPasswordHandler: express.RequestHandler = HandlerUtils.newRequestHandler<CreateUserPasswordRequest, CreateUserPasswordResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): CreateUserPasswordRequest => {
      var userId: string = req.params['userId'];
      RequestValidations.validateUUID(userId, 'userId');

      var networkId: string = req.params['networkId'];
      RequestValidations.validateUUID(networkId, 'networkId');

      return {
        userId: userId,
        networkId: networkId
      };
    },
    enactor: new CreateuserPasswordEnactor()
  });
}
