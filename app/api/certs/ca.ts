'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import {RequestEventHandlerFactory} from '../../../lib/event/event-handler';
import {CaCertManager} from '../../../lib/certs/ca-cert-manager';

var router: express.Router = express.Router();
var caCertManager: CaCertManager = new CaCertManager(require('../../../config/certs/ca/ca.json'));

interface GetCertsCaRequest { }

interface GetCertsCaResult {
  certificateMetadata: string;
}

class CertsCaRequestHandlerFactory extends RequestEventHandlerFactory<GetCertsCaRequest, GetCertsCaResult>{
  protected getRequest(expressReq: express.Request): GetCertsCaRequest {
    return {};
  }

  protected get isAsync(): boolean {
    return false;
  }

  protected handle(req: GetCertsCaRequest): GetCertsCaResult {
    return {
      certificateMetadata: caCertManager.certificateMetadata
    };
  }
}

export var getCertsCaHandler: express.RequestHandler = (new CertsCaRequestHandlerFactory()).handler;
