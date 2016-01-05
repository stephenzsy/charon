'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var ErrorCodes = exports.ErrorCodes = undefined;
(function (ErrorCodes) {
    var Authorization;
    (function (Authorization) {
        Authorization.InsufficientPrivileges = 'InsufficientPrivileges';
        Authorization.InvalidToken = 'InvalidToken';
        Authorization.AuthorizationRequired = 'AuthorizationTokenRequired';
        Authorization.TokenExpired = 'TokenExpired';
    })(Authorization = ErrorCodes.Authorization || (ErrorCodes.Authorization = {}));
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));