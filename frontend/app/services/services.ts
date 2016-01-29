import {NetworksService} from './networks';
import {UsersService} from './users';
import {SecretsService} from './secrets';
import {AuthTokenManager} from './base';
import {TokenScope} from '../models/auth';

export class CharonServices {
  private authTokenManager: AuthTokenManager;
  private _networks: NetworksService;
  private _users: UsersService;
  private _secrets: SecretsService;

  constructor($resource: angular.resource.IResourceService) {
    this.authTokenManager = new AuthTokenManager($resource, TokenScope.Admin);
    this._networks = new NetworksService($resource, this.authTokenManager);
    this._users = new UsersService($resource, this.authTokenManager);
    this._secrets = new SecretsService($resource, this.authTokenManager);
  }

  get networks(): NetworksService {
    return this._networks;
  }

  get users(): UsersService {
    return this._users;
  }

  get secrets(): SecretsService {
    return this._secrets;
  }

  static factory($resource: angular.resource.IResourceService) {
    return new CharonServices($resource);
  }
}


export var charonServicesName: string = 'charonServices';
export var charonServicesFactory = ['$resource', CharonServices.factory];
