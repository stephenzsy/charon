/// <reference path="../../..//typings/tsd.d.ts"/>

import {AuthToken, TokenScope} from '../models/auth';

interface AuthTokenResource extends angular.resource.IResource<AuthToken> {
}

interface AuthTokenResourceClass extends angular.resource.IResourceClass<AuthTokenResource> {
}

export class AuthTokenManager {
  private resource: AuthTokenResourceClass;
  private scope: string;
  private cachedToken: AuthToken = null;

  constructor($resource: angular.resource.IResourceService, scope: string) {
    this.resource = $resource<AuthTokenResource, AuthTokenResourceClass>('/api/auth/token', {}, {
      get: { method: 'get' }
    });
    this.scope = scope;
  }

  async getToken(): Promise<AuthToken> {
    if (!this.cachedToken || this.cachedToken.expiry < new Date()) {
      this.cachedToken = await this.resource.get({ scope: this.scope }).$promise;
    }
    return this.cachedToken;
  }
}

export type ServiceActions = { [name: string]: angular.resource.IActionDescriptor; }

export class ServiceBase<T, U> {
  private $resource: angular.resource.IResourceService;
  private authTokenManager: AuthTokenManager;
  private token: string = null;
  private path: string;
  private actions: ServiceActions;
  private _service: U;

  constructor(
    $resource: angular.resource.IResourceService,
    authTokenManager: AuthTokenManager,
    path: string,
    actions: ServiceActions) {
    this.$resource = $resource;
    this.authTokenManager = authTokenManager;
    this.path = path;
    this.actions = actions;
  }

  protected async service(): Promise<U> {
    var authToken: AuthToken = await this.authTokenManager.getToken();
    if (authToken.token !== this.token) {
      this.token = authToken.token;
      for (var name in this.actions) {
        if (!this.actions[name].headers) {
          this.actions[name].headers = {};
        }
        this.actions[name].headers['x-access-token'] = authToken.token;
      }
      this._service = this.$resource<T, U>(this.path, null, this.actions);
    }
    return this._service;
  }
}
