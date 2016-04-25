///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import User, * as Users from '../lib/models/users';

export interface SystemUsers {
    root: User;
    site: User;
    proxy: User;
    network: User;
}

export async function getSystemUsers(): Promise<SystemUsers> {
    var users: SystemUsers = <SystemUsers>{};
    users.root = await User.findByUsername('root', Users.UserType.System);
    users.site = await User.findByUsername('site', Users.UserType.System);
    users.proxy = await User.findByUsername('proxy', Users.UserType.System);
    users.network = await User.findByUsername('network', Users.UserType.System);

    return users;
}
