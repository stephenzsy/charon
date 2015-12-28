///<reference path="../../typings/q/Q.d.ts"/>

'use strict';

import * as Q from 'q';
import * as express from 'express';
import {CertBundle} from '../models/cert';
import {CertConfig} from '../models/app-configs';

export class CaCertBundle extends CertBundle {

}

export const caCertBundle: CaCertBundle = new CertBundle(require('../../config/certs/ca/ca.json'));
