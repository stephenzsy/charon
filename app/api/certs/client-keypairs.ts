/// <reference path="../../../typings/validator/validator.d.ts" />
'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as validator from 'validator';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {CreateClientKeypairRequest, CreateClientKeypairResult} from '../../../models/certs';
import {CertSubjectConfig, CertSubject} from '../../../lib/models/cert';
import {BadRequestError} from '../../../lib/models/errors';
import * as CertsCa from '../../../lib/certs/ca';
import {certsManager} from '../../../lib/certs/certs-manager';
import * as CertsUtils from '../../../lib/certs/utils';

const certsSubjectConfig: CertSubjectConfig = require('../../../config/init/certs-config.json');

class CreateClientKeypairEnactor extends ActionEnactor<CreateClientKeypairRequest, CreateClientKeypairResult>{
  async enactAsync(req: CreateClientKeypairRequest): Promise<CreateClientKeypairResult> {
    // create private key
    var privateKeyPemContent: string = null;
    var certSubject: CertSubject = new CertSubject(certsSubjectConfig);
    certSubject.commonName = certSubject.emailAddress = req.emailAddress;
    return certsManager.createClientKeypair(CertsUtils.getSubject(certSubject))
      .then(() => {
      return <CreateClientKeypairResult> {
        publicKeyPemContent: '',
        privateKeyPemContent: privateKeyPemContent,
      };
    });
  }
}

export module Handlers {
  export const createClientKeypairHandler: express.RequestHandler = HandlerUtils.newRequestHandler<CreateClientKeypairRequest, CreateClientKeypairResult>({
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
