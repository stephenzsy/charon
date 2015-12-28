/// <reference path="../../../lib/typings/jsonwebtoken.d.ts"/>

'use strict';

import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as Q from 'q';
import * as jwt from 'jsonwebtoken';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {AuthTokenConfig, TokenContext} from '../../../lib/models/app-configs';
import {TokenScope} from '../../../lib/models/contracts/common';
import {GetTokenRequest, GetTokenResult} from '../../../lib/models/contracts/auth';
import {BadRequestError} from '../../../lib/models/errors';

var tokenConfig: AuthTokenConfig = require('../../../config/auth-token.json');

export class GetTokenEnactor extends ActionEnactor<GetTokenRequest, GetTokenResult>{
  enactAsync(req: GetTokenRequest): Q.Promise<GetTokenResult> {
    var deferred: Q.Deferred<string> = Q.defer<string>();
    jwt.sign(
      <TokenContext>{ scope: req.scope },
      tokenConfig.privateKey, {
        algorithm: tokenConfig.algorithm,
        expiresIn: '1h'
      }, (token: string) => {
        deferred.resolve(token);
      });
    return deferred.promise.then((token: string): GetTokenResult => {
      return {
        scope: req.scope,
        token: token,
        expiry: Date.now() + 30 * 60 * 1000
      };
    })
  }
}

export module Handlers {
  export var getTokenHandler: express.RequestHandler = HandlerUtils.newRequestHandler<GetTokenRequest, GetTokenResult>({
    requestDeserializer: (req: express.Request): GetTokenRequest=> {
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
