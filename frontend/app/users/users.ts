import * as angular from 'angular';
import {User, ListUsersResult, GetUserResult} from '../models/users';
import {NetworkMetadata} from '../models/networks';
import {UserPasswordMetadata, CreateUserPasswordResult} from '../models/secrets';
import {CharonServices, charonServicesName} from '../services/services';

interface AddUserFormController extends angular.IFormController {

}

interface UsersControllerScope extends angular.IScope {
  addUserForm: AddUserFormController;
  addUserContext: {
    username?: string;
    email?: string;
  };
  addUserSubmit(): void;
  users: User[];
}

class UsersController {
  private $scope: UsersControllerScope;
  private charonServices: CharonServices;

  constructor($scope: UsersControllerScope, charonServices: CharonServices) {
    this.$scope = $scope;
    this.charonServices = charonServices;
    $scope.addUserContext = {};
    $scope.addUserSubmit = () => {
      this.createUser();
    }
    this.listusers();
  }

  private async createUser() {
    return await this.charonServices.users.createUser({
      username: this.$scope.addUserContext.username,
      email: this.$scope.addUserContext.email
    });
  }

  private async listusers() {
    var result: ListUsersResult = await this.charonServices.users.listUsers();
    this.$scope.users = result.items;
    this.$scope.$apply();
  }

}

export const name: string = 'UsersController';
export const controller = ['$scope', charonServicesName, UsersController];

interface NetworkScope extends NetworkMetadata {
  hasPassword: boolean;
  password?: UserPasswordMetadata;
}

interface UserControllerScope extends angular.IScope, User {
  networks: NetworkScope[];
  createPassword(networkId: string): void;
  deletePassword(passwordId: string): void;
}

class UserController {
  private userId: string;
  private $scope: UserControllerScope;
  private charonServices: CharonServices;

  constructor($scope: UserControllerScope, $routeParams: angular.route.IRouteParamsService, charonServices: CharonServices) {
    this.$scope = $scope;
    this.charonServices = charonServices;
    this.userId = $routeParams['id'];
    this.$scope.id = this.userId;
    $scope.createPassword = (networkId: string) => {
      this.createPassword(networkId);
    };
    $scope.deletePassword = (passwordId: string) => {
      this.deletePassword(passwordId);
    };
    this.loadData();
  }

  private async createPassword(networkId: string) {
    var result: CreateUserPasswordResult = await this.charonServices.secrets.createUserPassword({
      userId: this.userId,
      networkId: networkId
    });

    this.$scope.networks.forEach((ns: NetworkScope) => {
      if (ns.id === networkId) {
        ns.hasPassword = true;
        ns.password = result;
      }
    });
    this.$scope.$apply();
  }

  private async deletePassword(passwordId: string) {
    await this.charonServices.secrets.deleteUserPassword(passwordId);
    this.$scope.networks.forEach((ns: NetworkScope) => {
      if (ns.password && ns.password.id === passwordId) {
        delete ns.password;
        ns.hasPassword = false;
      }
    });
    this.$scope.$apply();
  }

  private async loadData() {
    var result: GetUserResult = await this.charonServices.users.getUser({ id: this.userId, withPasswords: true });
    this.$scope.username = result.username;
    this.$scope.email = result.email;
    let networks: NetworkMetadata[] = await this.charonServices.networks.listNetworks();
    let networkScopes: NetworkScope[] = [];
    let dict: { [id: string]: NetworkScope } = {};
    networks.forEach((network: NetworkMetadata) => {
      var ns: NetworkScope = {
        id: network.id,
        name: network.name,
        hasPassword: false
      };
      dict[network.id] = ns;
      networkScopes.push(ns);
    });
    result.passwords.forEach((password: UserPasswordMetadata) => {
      dict[password.networkId].hasPassword = true;
      dict[password.networkId].password = password;
    });
    this.$scope.networks = networkScopes;
    this.$scope.$apply();
  }
}

export const userControllerName: string = 'UserController';
export const userController = ['$scope', '$routeParams', charonServicesName, UserController];
