/// <reference path="../../../typings/jsonwebtoken/jsonwebtoken.d.ts"/>

'use strict';

import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as Q from 'q';
import * as jwt from 'jsonwebtoken';
import * as moment from 'moment';
const _moment: moment.MomentStatic = require('moment');
import * as validator from 'validator';

import {SyncActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {TokenContext} from '../../../lib/models/app-configs';
import {AuthTokenConfig} from '../../../lib/config/config';
import {TokenScope} from '../../../models/common';
import {ErrorCodes} from '../../../models/errors';
import {GetTokenRequest, GetTokenResult} from '../../../models/auth';
import {BadRequestError, AuthorizationError} from '../../../lib/models/errors';
import AppConfig from '../../../lib/config/config';

var tokenConfig: AuthTokenConfig = AppConfig.authTokenConfig;

interface GetTokenRequestInternal extends GetTokenRequest {
  certSerial: number;
}

export class GetTokenEnactor extends SyncActionEnactor<GetTokenRequestInternal, GetTokenResult>{
  enactSync(req: GetTokenRequestInternal): GetTokenResult {
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
    requestDeserializer: (req: express.Request): GetTokenRequestInternal => {
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
      var serialStr: string = req.get('x-ssl-client-serial');
      if (!validator.isInt(serialStr)) {
        throw new AuthorizationError(ErrorCodes.Authorization.AuthorizationRequired, 'Invalid client certificate serial: ' + serialStr);
      }
      return {
        scope: scope,
        certSerial: validator.toInt(serialStr)
      };
    },
    skipAuthorization: true,
    enactor: new GetTokenEnactor()
  });
}
