///<reference path="../typings/express/express.d.ts" />

'use strict';

import * as path from 'path';
import * as express from 'express';
import {Handlers as AuthTokenHandlers} from '../app/api/auth/token';
import {Handlers as CertsCaHandlers} from '../app/api/certs/ca';

var router: express.Router = express.Router();

// TODO: AuthN

// auth
router.get('/auth/token', AuthTokenHandlers.getTokenHandler);

// TODO: AuthZ

// certs
router.get('/certs/ca', CertsCaHandlers.getCaHandler);

router.get('*', function(req, res) {
  res.sendStatus(404);
});

module.exports = router;
