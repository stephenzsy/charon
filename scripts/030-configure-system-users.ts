///<reference path="../typings/mysql/mysql.d.ts"/>
///<reference path="../typings/sequelize/sequelize.d.ts"/>

import 'babel-polyfill';

import {sqlCharon} from '../lib/db/index';
import User, * as Users from '../lib/models/users';

async function createSystemUser(username: string): Promise<User> {
    var user: User = await User.findByUsername(username, Users.UserType.System);
    if (user != null) {
        user.delete(true);
    }
    return User.create(Users.UserType.System, username, username + '@system');
}

async function configure() {
    await createSystemUser('root');
    await createSystemUser('site');
    await createSystemUser('proxy');
    await createSystemUser('network');
    sqlCharon.sql.close();
}

configure();
