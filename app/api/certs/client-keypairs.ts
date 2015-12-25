'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';

import {ActionEnactor, RequestDeserializer, HandlerUtils, jsonResultSerializer} from '../../../lib/event/event-handler';
import {CreateClientKeypairRequest, CreateClientKeypairResult} from '../../../lib/models/contracts/certs';
import * as CertsCa from '../../../lib/certs/ca';

class CreateClientKeypairEnactor extends ActionEnactor<CreateClientKeypairRequest, CreateClientKeypairResult>{
  enactAsync(req: CreateClientKeypairRequest): Q.Promise<CreateClientKeypairResult> {
    var result: CreateClientKeypairResult = {
      publicKeyPemContent: '',
      privateKeyPemContent: '',
    }
    return Q.resolve(result);
  }
}

export module Handlers {
  export var createClientKeypairHandler: express.RequestHandler = HandlerUtils.newRequestHandler<CreateClientKeypairRequest, CreateClientKeypairResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): CreateClientKeypairRequest=> {
      return {};
    },
    enactor: new CreateClientKeypairEnactor()
  });
}
