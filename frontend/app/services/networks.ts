import * as angular from 'angular';
import {Network} from '../models/networks';

interface NetworkResource extends angular.resource.IResource<Network> {
}

interface NetworkResourceClass extends angular.resource.IResourceClass<NetworkResource> {
  list(): angular.resource.IResourceArray<NetworkResource>;
}

export class NetworksService {
  private networks: NetworkResourceClass;
  constructor($resource: angular.resource.IResourceService) {
    this.networks = $resource<NetworkResource, NetworkResourceClass>('/api/networks', null, {
      list: { method: 'get', isArray: true, cancellable: true }
    });
  }

  listNetworks() {
    console.log(this.networks.list());
  }
}
