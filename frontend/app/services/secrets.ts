import * as angular from 'angular';
import {CreateUserPasswordResult, CreateUserPasswordRequest, DeleteUserPasswordRequest} from '../models/secrets';
import {AuthTokenManager, ServiceBase, CharonResourceClass} from './base';

interface CreateUserPasswordResultResource extends angular.resource.IResource<CreateUserPasswordResult>, CreateUserPasswordResult { }

interface SecretsResourceClass extends CharonResourceClass {
  createUserPassword(request: CreateUserPasswordRequest): CreateUserPasswordResultResource;
  deleteUserPassword(request: DeleteUserPasswordRequest): void;
}

export class SecretsService extends ServiceBase<SecretsResourceClass> {
  constructor($resource: angular.resource.IResourceService, authTokenManager: AuthTokenManager) {
    super($resource, authTokenManager, '/', {
      createUserPassword: { method: 'POST', url: '/api/passwords' },
      deleteUserPassword: { method: 'DELETE', url: '/api/passwords/:id' }
    });
  }

  async createUserPassword(request: CreateUserPasswordRequest): Promise<CreateUserPasswordResult> {
    var resource: SecretsResourceClass = await this.getResource();
    return resource.createUserPassword(request);
  }

  async deleteUserPassword(passwordId: string): Promise<void> {
    var resource: SecretsResourceClass = await this.getResource();
    return resource.deleteUserPassword({ id: passwordId });
  }

}
