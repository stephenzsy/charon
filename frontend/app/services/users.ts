
import * as angular from 'angular';
import {User, ListUsersRequest, ListUsersResult, CreateUserRequest, CreateUserResult, GetUserRequest, GetUserResult} from '../models/users';
import {AuthTokenManager, CharonResourceClass, ServiceBase} from './base';

interface UserResource extends angular.resource.IResource<User>, User { }
interface GetUserResultResource extends angular.resource.IResource<GetUserResult>, GetUserResult { }
interface ListUsersResultResource extends angular.resource.IResource<ListUsersResult>, ListUsersResult { }
interface CreateUserResultResource extends angular.resource.IResource<CreateUserResult>, CreateUserResult { }

interface UsersResourceClass extends CharonResourceClass {
  list(request: ListUsersRequest): ListUsersResultResource;
  post(request: CreateUserRequest): CreateUserResultResource;
  getUser(request: GetUserRequest): GetUserResultResource;
}

export class UsersService extends ServiceBase<UsersResourceClass> {

  constructor($resource: angular.resource.IResourceService, authTokenManager: AuthTokenManager) {
    super($resource, authTokenManager, '/api/users', {
      list: { method: 'GET' },
      post: { method: 'POST' },
      getUser: { method: 'GET', url: '/api/users/:id' }
    });
  }

  async listUsers(type: string): Promise<ListUsersResult> {
    var service: UsersResourceClass = await this.getResource();
    return service.list({ type: type, limit: 20 }).$promise;
  }

  async getUser(request: GetUserRequest): Promise<GetUserResult> {
    var service: UsersResourceClass = await this.getResource();
    return service.getUser(request).$promise;
  }

  async createUser(request: CreateUserRequest): Promise<User> {
    var service: UsersResourceClass = await this.getResource();
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
