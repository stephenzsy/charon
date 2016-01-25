///<reference path="../typings/express/express.d.ts" />

'use strict';

import * as path from 'path';
import * as express from 'express';
import {Handlers as AuthTokenHandlers} from '../app/api/auth/token';
import {Handlers as CertsCaHandlers} from '../app/api/certs/ca';
import {Handlers as ClientKeypairsHandlers} from '../app/api/certs/client-keypairs';
import {Handlers as UsersHandlers} from '../app/api/users/users';
import {Handlers as PasswordsHandlers} from '../app/api/secrets/passwords';
import {Handlers as NetworkHandlers} from '../app/api/networks/networks';

const router: express.Router = express.Router();
const defaultFile: string = path.join(__dirname, '../frontend/index.html');
function handler(req, res, next) {
  res.sendFile(defaultFile);
}

router.get('/', handler);
router.get('/users', handler);
router.get('/networks', handler);

module.exports = router;
