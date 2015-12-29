/// <reference path="../../../typings/validator/validator.d.ts" />
'use strict';

import * as Q from 'q';
import * as child_process from 'child_process';
import * as path from 'path';
import * as express from 'express';
import * as validator from 'validator';

import {ActionEnactor, RequestDeserializer, HandlerUtils} from '../../../lib/event/event-handler';
import {CreateUserRequest, CreateUserResult} from '../../../lib/models/contracts/users';

class CreateUserEnactor extends ActionEnactor<CreateUserRequest, CreateUserResult>{
  enactAsync(req: CreateUserRequest): Q.Promise<CreateUserResult> {
    return Q.resolve<CreateUserResult>({
      id: ''
    });
  }
}
