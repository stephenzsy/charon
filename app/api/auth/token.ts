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

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {TokenContext} from '../../../lib/models/app-configs';
import {AuthTokenConfig} from '../../../lib/config/config';
import {TokenScope} from '../../../models/common';
import {ErrorCodes} from '../../../models/errors';
import {GetTokenRequest, GetTokenResult} from '../../../models/auth';
import {BadRequestError, AuthenticationError, AuthorizationError} from '../../../lib/models/errors';
import AppConfig from '../../../lib/config/config';
import User from '../../../lib/models/users';
import Cert from '../../../lib/models/certs';

var tokenConfig: AuthTokenConfig = AppConfig.authTokenConfig;

interface GetTokenRequestInternal extends GetTokenRequest {
  certSerial: number;
}

export class GetTokenEnactor extends ActionEnactor<GetTokenRequestInternal, GetTokenResult>{

  private async getAuthenticatedUser(certificateSerial: number): Promise<User> {
    var cert: Cert = await Cert.findBySerial(certificateSerial);
    if (!cert) {
      throw new AuthenticationError(ErrorCodes.Authentication.AuthenticationFailure, 'Invalid certificate with serial: ' + certificateSerial);
    }
    var user: User = await cert.getUser();
    if (!user) {
      throw new AuthenticationError(ErrorCodes.Authentication.AuthenticationFailure, 'Unable to resolve certificate to a user with certificate serial: ' + certificateSerial);
    }
    return user;

  }

  async enactAsync(req: GetTokenRequestInternal): Promise<GetTokenResult> {
    var user = await this.getAuthenticatedUser(req.certSerial);
    var authorizedScopes: string[] = await user.getPermissionScopes();
    if (authorizedScopes.indexOf(req.scope) < 0) {
      throw new AuthorizationError(ErrorCodes.Authorization.InsufficientPrivileges, 'User (' + user.username + ') does not have permission to request token with scope: ' + req.scope);
    }
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
      if (!validator.isHexadecimal(serialStr)) {
        throw new AuthenticationError(ErrorCodes.Authentication.AuthenticationRequired, 'Invalid client certificate serial: ' + serialStr);
      }
      return {
        scope: scope,
        certSerial: validator.toInt(serialStr, 16)
      };
    },
    skipAuthorization: true,
    enactor: new GetTokenEnactor()
  });
}
