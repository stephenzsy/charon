import * as Sequelize from 'sequelize';
var _Sequelize = require('sequelize');

import {SqlCharon, configureSqlCharon, SqlRadius, configureSqlRadius} from '../lib/db/schema';

export const sqlCharonSetup: SqlCharon = configureSqlCharon(new _Sequelize('charon', 'charon-setup', 'test'));
export const sqlRadiusSetup: SqlRadius = configureSqlRadius(new _Sequelize('radius', 'charon-setup', 'test'));
