import * as angular from 'angular';
import {CharonServices, charonServicesName} from '../services/services';

class NetworksController {
  constructor(charonServices: CharonServices) {
    charonServices.networks.listNetworks();
  }
}

export const networksControllerName: string = 'NetworksController';
export const networksController = [charonServicesName, NetworksController];
