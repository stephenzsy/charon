import * as angular from 'angular';
import {CharonServices, charonServicesName} from '../services/services';
import {Network} from '../models/networks';

interface NetworksScope extends angular.IScope {
  networks: Network[];
}

class NetworksController {
  private charonServices: CharonServices;
  private $scope: NetworksScope;

  constructor($scope: NetworksScope, charonServices: CharonServices) {
    this.$scope = $scope;
    this.charonServices = charonServices;

    this.loadData();
  }

  private async loadData(): Promise<void> {
    this.$scope.networks = await this.charonServices.networks.listNetworks();
    this.$scope.$apply();
  }
}

export const networksControllerName: string = 'NetworksController';
export const networksController = ['$scope', charonServicesName, NetworksController];
