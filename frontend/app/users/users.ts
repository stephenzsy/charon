import * as angular from 'angular';
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
}

class UsersController {
  private $scope: UsersControllerScope;
  private charonServices: CharonServices;

  constructor($scope, charonServices: CharonServices) {
    this.$scope = $scope;
    this.charonServices = charonServices;
    $scope.addUserContext = {};
    $scope.addUserSubmit = () => {
      this.createUser();
    }
    charonServices.users.listUsers();
  }

  private async createUser() {
    return await this.charonServices.users.createUser({
      username: this.$scope.addUserContext.username,
      email: this.$scope.addUserContext.email
    });
  }

}

export const name: string = 'UsersController';
export const controller = ['$scope', charonServicesName, UsersController];
