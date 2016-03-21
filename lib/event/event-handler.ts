///<reference path="../../typings/q/Q.d.ts"/>
///<reference path="../../typings/node-uuid/node-uuid.d.ts"/>

import * as express from 'express';
import * as Q from 'q';
import * as UUID from 'node-uuid';
import * as jwt from 'jsonwebtoken';

import {TokenContext} from '../models/app-configs';
import AppConfig, {AuthTokenConfig} from '../config/config';

import {AuthorizationError, UserError, ConflictResourceError, ResourceNotFoundError} from '../models/errors';
import {TokenScope} from '../../models/common';
import {ErrorCodes} from '../../models/errors';

interface Event {
  reqId: string;
  /**
   * true to stop proceeding to the next handler
   */
  isTerminal: boolean;
  expressReq?: express.Request;
  expressRes?: express.Response;
  authorization?: {
    err?: AuthorizationError;
    tokenContext?: TokenContext;
  }
  action?: {
    in?: any;
    out?: any;
    err?: any;
  }
}

interface EventHandler {
  name: string;
  before(event: Event): Promise<Event>;
  after(event: Event): Promise<Event>;
}

interface EventHandlerContainer {
  handler: EventHandler;
  next: EventHandlerContainer;
}

class EventHandlerChain {
  private chainHead: EventHandlerContainer;
  constructor(eventHandlers: EventHandler[]) {
    // build chain
    var head: EventHandlerContainer = null;
    var tail: EventHandlerContainer = null;
    eventHandlers.forEach((eh: EventHandler) => {
      if (head == null) {
        head = tail = {
          handler: eh,
          next: null
        };
      } else {
        tail.next = {
          handler: eh,
          next: null
        };
        tail = tail.next;
      }
      this.chainHead = head;
    });
  }

  public async handle(event: Event): Promise<Event> {
    return this.handleInternal(event, this.chainHead);
  }

  private async handleInternal(event: Event, handlerContainer: EventHandlerContainer): Promise<Event> {
    var handler: EventHandler = handlerContainer.handler;
    event = await handler.before(event);

    if (!event.isTerminal && handlerContainer.next) {
      event = await this.handleInternal(event, handlerContainer.next);
    }
    return handler.after(event);
  }
}

export abstract class ActionEnactor<TInput, TOutput>  {
  abstract async enactAsync(input: TInput): Promise<TOutput>;
}

export abstract class SyncActionEnactor<TInput, TOutput> extends ActionEnactor<TInput, TOutput> {
  abstract enactSync(input: TInput): TOutput;

  async enactAsync(input: TInput): Promise<TOutput> {
    return this.enactSync(input);
  }
}

class ActionHandler<TInput, TOutput> implements EventHandler {
  private enactor: ActionEnactor<TInput, TOutput>;
  constructor(enactor: ActionEnactor<TInput, TOutput>) {
    this.enactor = enactor;
  }

  get name(): string {
    return 'ActionHandler';
  }

  async before(event: Event): Promise<Event> {
    try {
      event.action.out = await this.enactor.enactAsync(event.action.in);
    } catch (err) {
      event.action.err = err;
    }
    return event;
  }

  async after(event: Event): Promise<Event> {
    return event;
  }
}

export type RequestDeserializer<TInput> = (req: express.Request) => TInput;
export type AsyncRequestDeserializer<TInput> = (req: express.Request) => Promise<TInput>;

export type ResultSerializer<TOutput> = (result: TOutput, expressRes: express.Response) => void;
export const jsonResultSerializer: ResultSerializer<any> = (result: any, expressRes: express.Response): void => {
  expressRes.status(200).send(result);
}

export interface RequestEventHandlerOptions<TInput, TOutput> {
  enactor: ActionEnactor<TInput, TOutput>;
  asyncRequestDeserializer?: AsyncRequestDeserializer<TInput>;
  requestDeserializer?: RequestDeserializer<TInput>;
  resultSerializer?: ResultSerializer<TOutput>;
  skipAuthorization?: boolean;
  requireAdminAuthoriztaion?: boolean;
}

class AsyncRequestModelHandler<TInput, TOutput> implements EventHandler {
  private requestDeserializer: AsyncRequestDeserializer<TInput>;
  private resultSerializer: ResultSerializer<TOutput>;

  constructor(requestDeserializer: AsyncRequestDeserializer<TInput>, resultSerializer: ResultSerializer<TOutput>) {
    this.requestDeserializer = requestDeserializer;
    this.resultSerializer = resultSerializer;
  }

  get name(): string {
    return 'AsyncRequestModelHandler';
  }

  async before(event: Event): Promise<Event> {
    event.action = {};
    try {
      event.action.in = await this.requestDeserializer(event.expressReq);
    } catch (err) {
      event.action.err = err;
      event.isTerminal = true;
    }
    return event;
  }

  async after(event: Event): Promise<Event> {
    if (event.action.err) {
      var err = event.action.err;
      if (err instanceof UserError) {
        if (err instanceof ResourceNotFoundError) {
          event.expressRes.status(404).send(err.jsonObj);
        } else if (err instanceof ConflictResourceError) {
          event.expressRes.status(409).send(err.jsonObj);
        } else {
          event.expressRes.status(400).send(err.jsonObj);
        }
      } else {
        console.error(err);
        console.error(err.stack);
        event.expressRes.sendStatus(500);
      }
    } else if (event.action.out) {
      this.resultSerializer(event.action.out, event.expressRes);
    } else {
      event.expressRes.sendStatus(200);
    }
    return event;
  }
}

class SyncRequestModelHandler<TInput, TOutput> extends AsyncRequestModelHandler<TInput, TOutput> {
  constructor(requestDeserializer: RequestDeserializer<TInput>, resultSerializer: ResultSerializer<TOutput>) {
    super((req: express.Request): Promise<TInput> => {
      try {
        return Promise.resolve(requestDeserializer(req));
      } catch (err) {
        return Promise.reject(err);
      }
    }, resultSerializer);
  }

  get name(): string {
    return 'SyncRequestModelHandler';
  }
}

class JsonWebTokenAuthorizationHandler implements EventHandler {
  private authTokenConfig: AuthTokenConfig;
  private authorizedScopes: string[];

  constructor(authTokenConfig: AuthTokenConfig, authorizedScopes: string[]) {
    this.authTokenConfig = authTokenConfig;
    this.authorizedScopes = authorizedScopes;
  }

  get name(): string {
    return 'JsonWebTokenAuthorizationHandler';
  }

  async before(event: Event): Promise<Event> {
    event.authorization = {};
    var token: string = event.expressReq.get('x-access-token') || event.expressReq.query['token'];
    if (!token) {
      event.authorization.err = new AuthorizationError(ErrorCodes.Authorization.AuthorizationRequired, "Authorization token is required");
      event.isTerminal = true;
      return event;
    }
    var tokenContext: TokenContext = null;
    try {
      tokenContext = await Q.nfcall<TokenContext>(jwt.verify, token, this.authTokenConfig.publicKey);
    } catch (err) {
      if (err && err.name === 'TokenExpiredError') {
        event.authorization.err = new AuthorizationError(ErrorCodes.Authorization.TokenExpired, "Expired authorization token");
      } else {
        event.authorization.err = new AuthorizationError(ErrorCodes.Authorization.InvalidToken, "Invalid authorization token");
      }
      event.isTerminal = true;
      return event;
    }
    if (this.authorizedScopes.indexOf(tokenContext.scope) < 0) {
      event.authorization.err = new AuthorizationError(ErrorCodes.Authorization.InsufficientPrivileges, "Insufficient privileges");
      event.isTerminal = true;
    } else {
      event.authorization.tokenContext = tokenContext;
    }
    return event;
  }

  async after(event: Event): Promise<Event> {
    if (event.authorization && event.authorization.err) {
      var err = event.authorization.err;
      event.expressRes.status(403).send(err.jsonObj);
    }
    return event;
  }
}

export class HandlerUtils {
  private static createEvent(req: express.Request, res: express.Response): Event {
    return {
      reqId: UUID.v4(),
      isTerminal: false,
      expressReq: req,
      expressRes: res
    };
  }

  public static newRequestHandler<TInput, TOutput>(options: RequestEventHandlerOptions<TInput, TOutput>): express.RequestHandler {
    var handlers: EventHandler[] = [];
    if (!options.skipAuthorization) {
      if (options.requireAdminAuthoriztaion) {
        handlers.push(new JsonWebTokenAuthorizationHandler(AppConfig.authTokenConfig, [TokenScope.Admin]))
      } else {
        handlers.push(new JsonWebTokenAuthorizationHandler(AppConfig.authTokenConfig, [TokenScope.Public, TokenScope.Admin]))
      }
    }

    var serializer: ResultSerializer<TOutput> = (options.resultSerializer) ? options.resultSerializer : jsonResultSerializer;
    if (options.asyncRequestDeserializer) {
      handlers.push(new AsyncRequestModelHandler(options.asyncRequestDeserializer, serializer));
    } else {
      handlers.push(new SyncRequestModelHandler(options.requestDeserializer, serializer));
    }

    handlers.push(new ActionHandler(options.enactor));

    var handlerChain: EventHandlerChain = new EventHandlerChain(handlers);
    return function(req: express.Request, res: express.Response) {
      handlerChain.handle(HandlerUtils.createEvent(req, res));
    };
  }
}
