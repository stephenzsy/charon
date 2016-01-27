
import * as angular from 'angular';
import {User, ListUsersResult, CreateUserRequest, CreateUserResult} from '../models/users';
import {AuthTokenManager, ServiceBase} from './base';

interface UserResource extends angular.resource.IResource<User>, User {
}

interface ListUsersResultResource extends angular.resource.IResource<ListUsersResult>, ListUsersResult {
}

interface CreateUserResultResource extends angular.resource.IResource<CreateUserResult>, CreateUserResult {
}

interface UserResourceClass extends angular.resource.IResourceClass<UserResource> {
  list(): ListUsersResultResource;
  post(request: CreateUserRequest): CreateUserResultResource
}

export class UsersService extends ServiceBase<UserResource, UserResourceClass> {

  constructor($resource: angular.resource.IResourceService, authTokenManager: AuthTokenManager) {
    super($resource, authTokenManager, '/api/users', {
      list: { method: 'GET' },
      post: { method: 'POST' }
    });
  }

  async listUsers(): Promise<User[]> {
    var service: UserResourceClass = await this.service();
    var result: ListUsersResult = await service.list().$promise;
    return result.items;
  }

  async createUser(request: CreateUserRequest): Promise<User> {
    var service: UserResourceClass = await this.service();
    try {
      var result: CreateUserResult = await service.post(request).$promise;
      return {
        id: result.id,
        createdAt: result.createdAt,
        username: request.username,
        email: request.email
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

}
