import * as Sequelize from 'sequelize';
import * as UserModels from './users';
import * as PasswordModels from './passwds';
import * as CertModels from './certs';
import * as PermissionModels from './permissions';

export interface SqlCharon {
    sql: Sequelize.Sequelize;
    userModel: UserModels.UserModel;
    passwordModel: PasswordModels.PasswordModel;
    certModel: CertModels.CertModel;
    permissionModel: PermissionModels.PermissionModel;
}

export interface SqlRadius {
    sql: Sequelize.Sequelize;
}

export function configureSqlCharon(sql: Sequelize.Sequelize): SqlCharon {
    var userModel = new UserModels.DataAccessUser(sql).model;
    return {
        sql: sql,
        userModel: userModel,
        passwordModel: new PasswordModels.DataAccessPassword(sql, userModel).model,
        certModel: new CertModels.DataAccessCert(sql, userModel).model,
        permissionModel: new PermissionModels.DataAccessPermission(sql, userModel).model
    };
}

export function configureSqlRadius(sql: Sequelize.Sequelize): SqlRadius {
    return {
        sql: sql
    };
}