'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';

import {SyncActionEnactor, RequestDeserializer, HandlerUtils, jsonResultSerializer} from '../../../lib/event/event-handler';
import {GetCaRequest, GetCaResult, CertFormat} from '../../../lib/models/contracts/certs';
import * as CertsCa from '../../../lib/certs/ca';

class GetCaEnactor extends SyncActionEnactor<GetCaRequest, GetCaResult>{
  enactSync(req: GetCaRequest): GetCaResult {
    var result: GetCaResult = {
      rawCertificateMetadata: CertsCa.caCertBundle.certificateMetadata
    };
    if (req.format === CertFormat.Pem) {
      result._certificatePemPath = CertsCa.caCertBundle.certificatePemFile
    }
    return result;
  }
}

export module Handlers {
  export var getCaHandler: express.RequestHandler = HandlerUtils.newRequestHandler<GetCaRequest, GetCaResult>({
    requestDeserializer: (req: express.Request): GetCaRequest=> {
      var format: string = CertFormat.MetadataJson;
      switch (req.query['format']) {
        case CertFormat.Pem:
          format = CertFormat.Pem;
          break;
        default: // use default MetadataJson
      }
      return {
        format: format
      };
    },
    resultSerializer: (result: GetCaResult, res: express.Response): void => {
      if (result._certificatePemPath) {
        res.sendFile(result._certificatePemPath);
      } else {
        jsonResultSerializer(result, res);
      }
    },
    enactor: new GetCaEnactor()
  });
}
