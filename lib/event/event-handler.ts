///<reference path="../../typings/q/Q.d.ts"/>

import * as express from 'express';
import * as Q from 'q';

export interface Event<TRequest, TResult> {
  originalRequest: express.Request;
  originalResponse: express.Response;
  req?: TRequest;
  res?: TResult;
}

export abstract class RequestEventHandlerFactory<TRequest, TResult> {

  protected abstract getRequest(expressReq: express.Request): TRequest;
  protected handleAsync(req: TRequest): Q.Promise<TResult> {
    throw 'Not Implemented';
  }
  protected handle(req: TRequest): TResult {
    throw 'Not Implemented';
  }
  protected get isAsync(): boolean { return true; }

  private createEvent(req: express.Request, res: express.Response): Event<TRequest, TResult> {
    return {
      originalRequest: req,
      originalResponse: res
    };
  }

  get handler(): express.RequestHandler {
    return (req: express.Request, res: express.Response) => {
      var event: Event<TRequest, TResult> = this.createEvent(req, res);
      event.req = this.getRequest(req);
      if (this.isAsync) {
        this.handleAsync(event.req).then((result: TResult) => {
          event.res = result;
          event.originalResponse.send(result);
        }, (err: any) => {
            console.error(err);
            event.originalResponse.sendStatus(500);
          });
      } else {
        try {
          let result: TResult = this.handle(event.req);
          event.originalResponse.send(result);
        } catch (e) {
          event.originalResponse.sendStatus(500);
        }
      }
    };
  }
}
