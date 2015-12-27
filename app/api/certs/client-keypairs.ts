/// <reference path="../../../typings/validator/validator.d.ts" />
'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as validator from 'validator';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {CreateClientKeypairRequest, CreateClientKeypairResult} from '../../../lib/models/contracts/certs';
import {BadRequestError} from '../../../lib/models/errors';
import * as CertsCa from '../../../lib/certs/ca';
import * as CertsUtils from '../../../lib/certs/utils';

class CreateClientKeypairEnactor extends ActionEnactor<CreateClientKeypairRequest, CreateClientKeypairResult>{
  enactAsync(req: CreateClientKeypairRequest): Q.Promise<CreateClientKeypairResult> {
    // create private key
    var privateKeyPemContent: string = null;
    return CertsUtils.createPrivateKey().then((privateKey: string) => {
      privateKeyPemContent = privateKey;
    }).then(() => {
      return <CreateClientKeypairResult> {
        publicKeyPemContent: '',
        privateKeyPemContent: privateKeyPemContent,
      };
    });
  }
}

export module Handlers {
  export var createClientKeypairHandler: express.RequestHandler = HandlerUtils.newRequestHandler<CreateClientKeypairRequest, CreateClientKeypairResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): CreateClientKeypairRequest=> {
      var emailAddress: string = req.body['emailAddress'];
      if (!validator.isEmail(emailAddress)) {
        throw new BadRequestError('A valid email address is required to create a client key pair.');
      }
      return {
        emailAddress: emailAddress
      };
    },
    enactor: new CreateClientKeypairEnactor()
  });
}
