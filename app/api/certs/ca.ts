'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';

import {SyncActionEnactor, RequestModelConverter, HandlerUtils} from '../../../lib/event/event-handler';
import {GetCaRequest, GetCaResult} from '../../../lib/models/contracts/certs';
//import {BadRequestError} from '../../../lib/models/errors';
import {CaCertManager} from '../../../lib/certs/ca-cert-manager';

var caCertManager: CaCertManager = new CaCertManager(require('../../../config/certs/ca/ca.json'));


class GetCaEnactor extends SyncActionEnactor<GetCaRequest, GetCaResult>{
  enactSync(req: GetCaRequest): GetCaResult {
    return {
      rawCertificateMetadata: caCertManager.certificateMetadata
    };
  }
}

export module Handlers {
  export var getCaHandler: express.RequestHandler = HandlerUtils.newRequestHandler<GetCaRequest, GetCaResult>({
    requestModelConverter: (req: express.Request): GetCaRequest=> {
      return {};
    },
    enactor: new GetCaEnactor()
  });
}
