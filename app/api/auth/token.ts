/// <reference path="../../../lib/typings/jsonwebtoken.d.ts"/>

'use strict';

import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as Q from 'q';
import * as jwt from 'jsonwebtoken';

import {RequestEventHandlerFactory, BadRequestError} from '../../../lib/event/event-handler';
import {AuthTokenConfig} from '../../../lib/models/security-configs';

var tokenConfig: AuthTokenConfig = require('../../../config/auth-token.json');

interface GetTokenRequest {
  scope: string;
}

interface GetTokenResult {
  scope: string;
  token: string;
}

const ScopePublic: string = 'public';
const ScopeAdmin: string = 'admin';

class GetTokenHandlerFactory extends RequestEventHandlerFactory<GetTokenRequest, GetTokenResult>{
  protected getRequest(expressReq: express.Request): GetTokenRequest {
    let scope: string = ScopePublic;
    if (expressReq.query && expressReq.query['scope']) {
      switch (expressReq.query['scope']) {
        case ScopePublic:
          scope = ScopePublic;
          break;
        case ScopeAdmin:
          scope = ScopeAdmin;
          break;
        default:
          throw new BadRequestError('Invalid Request');
      }
    }
    return {
      scope: scope
    };
  }

  protected get isAsync(): boolean {
    return true;
  }

  protected handleAsync(req: GetTokenRequest): Q.Promise<GetTokenResult> {
    var deferred: Q.Deferred<string> = Q.defer<string>();
    jwt.sign({ scope: req.scope }, tokenConfig.privateKey, {
      algorithm: 'ES384',
      expiresIn: '1h'
    }, function(token: string) {
        deferred.resolve(token);
      });
    return deferred.promise.then((token: string): GetTokenResult => {
      return {
        scope: req.scope,
        token: token
      };
    })
  }
}

export var getTokenHandler: express.RequestHandler = (new GetTokenHandlerFactory()).handler;
