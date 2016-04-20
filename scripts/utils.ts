///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import * as db from 'charon/lib/db/index';
import User, * as Users from 'charon/lib/models/users';

export interface SystemUsers {
    root: User;
    site: User;
    proxy: User;
    network: User;
    db: User;
}

export async function getSystemUsers(): Promise<SystemUsers> {
    var users: SystemUsers = <SystemUsers>{};
    users.root = await User.findByUsername('root', Users.UserType.System);
    users.site = await User.findByUsername('site', Users.UserType.System);
    users.proxy = await User.findByUsername('proxy', Users.UserType.System);
    users.network = await User.findByUsername('network', Users.UserType.System);
    users.db = await User.findByUsername('db', Users.UserType.System);

    return users;
}