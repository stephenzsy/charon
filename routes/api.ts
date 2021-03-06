///<reference path="../typings/express/express.d.ts" />

'use strict';

import * as path from 'path';
import * as express from 'express';
import {Handlers as AuthTokenHandlers} from '../app/api/auth/token';
import {Handlers as CertsCaHandlers} from '../app/api/certs/ca';
import {Handlers as UsersHandlers} from '../app/api/users/users';
import {Handlers as PasswordsHandlers} from '../app/api/secrets/passwords';
import {Handlers as NetworkHandlers} from '../app/api/networks/networks';

var router: express.Router = express.Router();

// TODO: AuthN

// auth
router.get('/auth/token', AuthTokenHandlers.getTokenHandler);

// Authorized calls

// certs
router.get('/certs/ca', CertsCaHandlers.getCaHandler);

// users
router.get('/users', UsersHandlers.listUsersHandler);
router.get('/users/:id', UsersHandlers.getUserHandler);
router.delete('/users/:id', UsersHandlers.deleteUserHandler);
router.post('/users', UsersHandlers.createUserHandler);

// user passwords
router.post('/passwords', PasswordsHandlers.createUserPasswordHandler);
router.delete('/passwords/:id', PasswordsHandlers.deleteUswerPasswordHandler);

// networks
router.get('/networks', NetworkHandlers.listNetworksHandler);

router.all('*', function(req, res) {
  res.sendStatus(404);
});

module.exports = router;
