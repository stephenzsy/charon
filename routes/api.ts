///<reference path="../typings/express/express.d.ts" />

'use strict';

import * as path from 'path';
import * as express from 'express';
import {getTokenHandler} from '../app/api/auth/token';
import {getCertsCaHandler} from '../app/api/certs/ca';

var router: express.Router = express.Router();

// auth
router.get('/auth/token', getTokenHandler);

// TODO: AuthN
// TODO: AuthZ

// certs
router.get('/certs/ca', getCertsCaHandler);

router.get('*', function(req, res) {
  res.sendStatus(404);
});

module.exports = router;
