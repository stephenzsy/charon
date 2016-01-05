'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';

import {SyncActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {GetCaRequest, GetCaResult, CertFormat} from '../../../models/certs';
import * as CertsCa from '../../../lib/certs/ca';

class GetCaEnactor extends SyncActionEnactor<GetCaRequest, GetCaResult>{
  enactSync(req: GetCaRequest): GetCaResult {
    var result: GetCaResult = {
      rawCertificateMetadata: CertsCa.caCertBundle.certificateMetadata,
      certificatePemContent: CertsCa.caCertBundle.certificatePemContent
    };
    return result;
  }
}

export module Handlers {
  export const getCaHandler: express.RequestHandler = HandlerUtils.newRequestHandler<GetCaRequest, GetCaResult>({
    requestDeserializer: (req: express.Request): GetCaRequest=> {
      return null;
    },
    enactor: new GetCaEnactor()
  });
}
