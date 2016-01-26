import {NetworksService} from './networks';
import {AuthTokenManager} from './base';
import {TokenScope} from '../models/auth';

export class CharonServices {
  private authTokenManager: AuthTokenManager;
  private _networks: NetworksService;

  constructor($resource: angular.resource.IResourceService) {
    this.authTokenManager = new AuthTokenManager($resource, TokenScope.Admin);
    this._networks = new NetworksService($resource, this.authTokenManager);
  }

  get networks(): NetworksService {
    return this._networks;
  }

  static factory($resource: angular.resource.IResourceService) {
    return new CharonServices($resource);
  }
}


export var charonServicesName: string = 'charonServices';
export var charonServicesFactory = ['$resource', CharonServices.factory];
