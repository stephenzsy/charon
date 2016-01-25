import {NetworksService} from './networks';
import {AuthToken, TokenScope} from '../models/auth';

interface AuthTokenResourceClass extends angular.resource.IResourceClass<AuthToken> {
}

class AuthTokenManager {
  private resource: AuthTokenResourceClass;
  private scope: string;

  constructor($resource: angular.resource.IResourceService, scope: string) {
    this.resource = $resource<AuthToken>('/api/auth/token', {}, {
      get: { method: 'get' }
    });
    this.scope = scope;
  }

  async getToken() {
    var token: AuthToken = await this.resource.get({ scope: this.scope });
    console.log(token);
  }
}

export class CharonServices {
  private authTokenManager: AuthTokenManager;
  private _networks: NetworksService;

  constructor($resource: angular.resource.IResourceService) {
    this.authTokenManager = new AuthTokenManager($resource, TokenScope.Admin);
    this.authTokenManager.getToken();
    this._networks = new NetworksService($resource);
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
