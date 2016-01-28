import * as angular from 'angular';
import {User, ListUsersResult, GetUserResult} from '../models/users';
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

interface UserControllerScope extends angular.IScope, User {
}

class UserController {
  private $scope: UserControllerScope;
  private charonServices: CharonServices;

  constructor($scope: UserControllerScope, $routeParams: angular.route.IRouteParamsService, charonServices: CharonServices) {
    this.$scope = $scope;
    this.charonServices = charonServices;
    $scope.id = $routeParams['id'];
    this.getUser();
  }

  private async getUser() {
    var result: GetUserResult = await this.charonServices.users.getUser({ id: this.$scope.id, withPasswords: true });
    this.$scope.username = result.username;
    this.$scope.email = result.email;
    this.$scope.$apply();
  }
}

export const userControllerName: string = 'UserController';
export const userController = ['$scope', '$routeParams', charonServicesName, UserController];
