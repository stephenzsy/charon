///<reference path="../../typings/q/Q.d.ts"/>
///<reference path="../../typings/node-uuid/node-uuid.d.ts"/>

import * as express from 'express';
import * as UUID from 'node-uuid';
import * as Q from 'q';
import * as jwt from 'jsonwebtoken';

import {AuthTokenConfig, TokenScope, TokenContext} from '../models/security-configs';
import {AuthorizationError, UserError} from '../models/errors';
import {ErrorCodes} from '../models/contracts/errors';

var tokenConfig: AuthTokenConfig = require('../../config/auth-token.json');

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
  before(event: Event): Q.Promise<Event>;
  after(event: Event): Q.Promise<Event>;
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

  public handle(event: Event): Q.Promise<Event> {
    return this.handleInternal(event, this.chainHead);
  }

  private handleInternal(event: Event, handlerContainer: EventHandlerContainer): Q.Promise<Event> {
    var handler: EventHandler = handlerContainer.handler;
    return handler.before(event).then(
      (postBeforeEvent: Event): Event | Q.Promise<Event> => {
        if (!postBeforeEvent.isTerminal && handlerContainer.next) {
          return this.handleInternal(postBeforeEvent, handlerContainer.next);
        }
        return event;
      }).then(
      (postNextEvent: Event): Q.Promise<Event>=> {
        return handler.after(postNextEvent);
      });
  }
}

export abstract class ActionEnactor<TInput, TOutput>  {
  abstract enactAsync(input: TInput): Q.Promise<TOutput>;
}

export abstract class SyncActionEnactor<TInput, TOutput> extends ActionEnactor<TInput, TOutput> {
  abstract enactSync(input: TInput): TOutput;

  enactAsync(input: TInput): Q.Promise<TOutput> {
    try {
      var output: TOutput = this.enactSync(input);
      return Q.resolve(output);
    } catch (err) {
      return Q.reject<TOutput>(err);
    }
  }
}

class ActionHandler<TInput, TOutput> implements EventHandler {
  private enactor: ActionEnactor<TInput, TOutput>;
  constructor(enactor: ActionEnactor<TInput, TOutput>) {
    this.enactor = enactor;
  }

  before(event: Event): Q.Promise<Event> {
    return this.enactor.enactAsync(event.action.in).then((output: TOutput): Event => {
      event.action.out = output;
      return event;
    }, (err: any): Event => {
        event.action.err = err;
        return event;
      });
  }

  after(event: Event): Q.Promise<Event> {
    return Q.resolve(event);
  }
}

export type RequestModelConverter<TInput> = (req: express.Request) => TInput;

export interface RequestEventHandlerOptions<TInput, TOutput> {
  enactor: ActionEnactor<TInput, TOutput>;
  requestModelConverter: RequestModelConverter<TInput>;
  skipAutorization?: boolean;
  requireAdminAuthoriztaion?: boolean;
}

class RequestModelHandler<TInput> implements EventHandler {
  private requestModelConverter: RequestModelConverter<TInput>;

  constructor(requestModelConverter: RequestModelConverter<TInput>) {
    this.requestModelConverter = requestModelConverter;
  }

  before(event: Event): Q.Promise<Event> {
    event.action = {};
    try {
      event.action.in = this.requestModelConverter(event.expressReq);
    } catch (err) {
      event.action.err = err;
      event.isTerminal = true;
    }
    return Q.resolve(event);
  }

  after(event: Event): Q.Promise<Event> {
    if (event.action.err) {
      var err = event.action.err;
      if (err instanceof UserError) {
        event.expressRes.status(400).send(err.jsonObj);
      } else {
        event.expressRes.sendStatus(500);
      }
    } else if (event.action.out) {
      event.expressRes.status(200).send(event.action.out);
    } else {
      event.expressRes.sendStatus(200);
    }
    return Q.resolve(event);
  }
}

class JsonWebTokenAuthorizationHandler implements EventHandler {
  private authTokenConfig: AuthTokenConfig;
  private authorizedScopes: string[];

  constructor(authTokenConfig: AuthTokenConfig, authorizedScopes: string[]) {
    this.authTokenConfig = authTokenConfig;
    this.authorizedScopes = authorizedScopes;
  }

  before(event: Event): Q.Promise<Event> {
    event.authorization = {};
    var token: string = event.expressReq.get('x-access-token') || event.expressReq.query['token'];
    if (!token) {
      event.authorization.err = new AuthorizationError(ErrorCodes.Authorization.AuthorizationRequired, "Authorization token is required");
      event.isTerminal = true;
      return Q.resolve(event);
    }
    return Q.nfcall(jwt.verify, token, this.authTokenConfig.publicKey).then(
      (tokenContext: TokenContext): Event=> {
        if (this.authorizedScopes.indexOf(tokenContext.scope) < 0) {
          event.authorization.err = event.authorization.err = new AuthorizationError(ErrorCodes.Authorization.InsufficientPrivileges, "Insufficient privileges");
          event.isTerminal = true;
        } else {
          event.authorization.tokenContext = tokenContext;
        }
        return event;
      }, (err): Event => {
        event.authorization.err = event.authorization.err = new AuthorizationError(ErrorCodes.Authorization.InvalidToken, "Invalid authorization token");
        event.isTerminal = true;
        return event;
      });
  }

  after(event: Event): Q.Promise<Event> {
    if (event.authorization && event.authorization.err) {
      var err = event.authorization.err;
      event.expressRes.status(403).send(err.jsonObj);
    }
    return Q.resolve(event);
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
    if (!options.skipAutorization) {
      if (options.requireAdminAuthoriztaion) {
        handlers.push(new JsonWebTokenAuthorizationHandler(tokenConfig, [TokenScope.Admin]))
      } else {
        handlers.push(new JsonWebTokenAuthorizationHandler(tokenConfig, [TokenScope.Public, TokenScope.Admin]))
      }
    }

    handlers.push(new RequestModelHandler(options.requestModelConverter));
    handlers.push(new ActionHandler(options.enactor));

    var handlerChain: EventHandlerChain = new EventHandlerChain(handlers);
    return function(req: express.Request, res: express.Response) {
      handlerChain.handle(HandlerUtils.createEvent(req, res)).done();
    };
  }
}
