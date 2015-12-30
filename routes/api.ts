///<reference path="../typings/express/express.d.ts" />

'use strict';

import * as path from 'path';
import * as express from 'express';
import {Handlers as AuthTokenHandlers} from '../app/api/auth/token';
import {Handlers as CertsCaHandlers} from '../app/api/certs/ca';
import {Handlers as ClientKeypairsHandlers} from '../app/api/certs/client-keypairs';
import {Handlers as UsersHandlers} from '../app/api/users/users';

var router: express.Router = express.Router();

// TODO: AuthN

// auth
router.get('/auth/token', AuthTokenHandlers.getTokenHandler);

// Authorized calls

// certs
router.get('/certs/ca', CertsCaHandlers.getCaHandler);
router.post('/certs/client-keypairs', ClientKeypairsHandlers.createClientKeypairHandler);
router.post('/users', UsersHandlers.createUserHandler);

router.get('*', function(req, res) {
  res.sendStatus(404);
});

module.exports = router;
