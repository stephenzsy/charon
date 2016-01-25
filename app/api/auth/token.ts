/// <reference path="../../../typings/jsonwebtoken/jsonwebtoken.d.ts"/>

'use strict';

import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as Q from 'q';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
const _moment: moment.MomentStatic = require('moment');

import {SyncActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {AuthTokenConfig, TokenContext} from '../../../lib/models/app-configs';
import {TokenScope} from '../../../models/common';
import {GetTokenRequest, GetTokenResult} from '../../../models/auth';
import {BadRequestError} from '../../../lib/models/errors';

var tokenConfig: AuthTokenConfig = require('../../../config/auth-token.json');

export class GetTokenEnactor extends SyncActionEnactor<GetTokenRequest, GetTokenResult>{
  enactSync(req: GetTokenRequest): GetTokenResult {
    var token = jwt.sign(
      <TokenContext>{ scope: req.scope },
      tokenConfig.privateKey, {
        algorithm: tokenConfig.algorithm,
        expiresIn: '1h'
      });
    return {
      scope: req.scope,
      token: token,
      expiry: _moment().add(55, 'minutes').toDate()
    };
  }
}

export module Handlers {
  export const getTokenHandler: express.RequestHandler = HandlerUtils.newRequestHandler<GetTokenRequest, GetTokenResult>({
    requestDeserializer: (req: express.Request): GetTokenRequest => {
      let scope: string = TokenScope.Public;
      if (req.query && req.query['scope']) {
        switch (req.query['scope']) {
          case TokenScope.Public:
            scope = TokenScope.Public;
            break;
          case TokenScope.Admin:
            scope = TokenScope.Admin;
            break;
          default:
            throw new BadRequestError('Invalid Request');
        }
      }
      return {
        scope: scope
      };
    },
    skipAutorization: true,
    enactor: new GetTokenEnactor()
  });
}
