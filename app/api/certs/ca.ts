'use strict';

import * as path from 'path';
import * as express from 'express';
import {CaCertManager} from '../../../lib/certs/ca-cert-manager';

var router: express.Router = express.Router();
var caCertManager: CaCertManager = new CaCertManager(require('../../../config/ca.json'));

export var getCertsCaHandler: express.RequestHandler = function(req: express.Request, res: express.Response): any {
  console.log("OK");
  res.send(caCertManager.certPath);
}
