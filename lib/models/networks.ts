///<reference path="../../typings/sequelize/sequelize.d.ts"/>

import * as Q from 'q';
var _Q = require('q');

import {NetworkModel} from '../db/index';
import {NetworkInstance, NetworkContext, NetworkInternal} from '../db/networks';
import {ModelInstance} from './common';

export class Network extends ModelInstance<NetworkInstance> {
  // static methods
  static create(context: NetworkContext): Q.Promise<Network> {
    return _Q(NetworkModel.create(<NetworkInternal>context))
      .then((instance: NetworkInstance): Network => {
      return new Network(instance);
    });
  }
}
