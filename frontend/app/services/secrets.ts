import * as angular from 'angular';
import {CreateUserPasswordResult, CreateUserPasswordRequest} from '../models/secrets';
import {AuthTokenManager, ServiceBase, CharonResourceClass} from './base';

interface CreateUserPasswordResultResource extends angular.resource.IResource<CreateUserPasswordResult>, CreateUserPasswordResult { }

interface SecretsResourceClass extends CharonResourceClass {
  createUserPassword(request: CreateUserPasswordRequest): CreateUserPasswordResultResource;
}

export class SecretsService extends ServiceBase<SecretsResourceClass> {
  constructor($resource: angular.resource.IResourceService, authTokenManager: AuthTokenManager) {
    super($resource, authTokenManager, '/', {
      createUserPassword: { method: 'POST', url: '/api/passwords' }
    });
  }

  async CreateUserPassword(request: CreateUserPasswordRequest): Promise<CreateUserPasswordResult> {
    var resource: SecretsResourceClass = await this.getResource();
    return resource.createUserPassword(request);
  }

}
