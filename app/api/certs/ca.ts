'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import {RequestEventHandlerFactory} from '../../../lib/event/event-handler';
import {CaCertManager} from '../../../lib/certs/ca-cert-manager';

var router: express.Router = express.Router();
var caCertManager: CaCertManager = new CaCertManager(require('../../../config/ca.json'));

interface GetCertsCaRequest { }

interface GetCertsCaResult {
  certificateInfoText: string;
}

class CertsCaRequestHandlerFactory extends RequestEventHandlerFactory<GetCertsCaRequest, GetCertsCaResult>{
  protected getRequest(expressReq: express.Request): GetCertsCaRequest {
    return {};
  }

  protected handleAsync(req: GetCertsCaRequest): Q.Promise<GetCertsCaResult> {
    return Q.nfcall(child_process.execFile, 'openssl', [
      'x509',
      '-in', caCertManager.certPath,
      '-text',
      '-noout'], null).then((stdout: string): GetCertsCaResult=> {
      return {
        certificateInfoText: stdout
      };
    });
  }
}

export var getCertsCaHandler: express.RequestHandler = (new CertsCaRequestHandlerFactory()).handler;
