import * as angular from 'angular';
import {Network} from '../models/networks';
import {AuthTokenManager, ServiceBase, CharonResourceClass} from './base';

interface NetworkResource extends angular.resource.IResource<Network>, Network {
}

interface NetworkResourceClass extends CharonResourceClass {
  list(): angular.resource.IResourceArray<NetworkResource>;
}

export class NetworksService extends ServiceBase<NetworkResourceClass> {
  private cachedNetworks: Network[] = null;

  constructor($resource: angular.resource.IResourceService, authTokenManager: AuthTokenManager) {
    super($resource, authTokenManager, '/api/networks', {
      list: { method: 'GET', isArray: true }
    });
  }

  async listNetworks(): Promise<Network[]> {
    if (this.cachedNetworks) {
      return this.cachedNetworks;
    }
    var service: NetworkResourceClass = await this.getResource();
    var networks: angular.resource.IResourceArray<NetworkResource> = await service.list().$promise;
    this.cachedNetworks = networks;
    return this.cachedNetworks;
  }

}
