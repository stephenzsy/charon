import {CommonDataInternal} from '../db/common';

export interface CollectionQueryResult<T, TMarker> {
  count: number;
  items: T[];
  lastMarker?: TMarker;
}

export class ModelInstance<T extends CommonDataInternal>{
  protected _instance: T;
  constructor(instance: T) {
    if (!instance) {
      throw 'Null instance not allowed';
    }
    this._instance = instance;
  }

  get instance(): T {
    return this._instance;
  }

  get id(): string {
    return this.instance.uid;
  }

  get sequenceId(): number {
    return this.instance.id;
  }
}
