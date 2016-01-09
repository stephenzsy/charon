export interface CollectionQueryResult<T, TMarker> {
  count: number;
  items: T[];
  lastMarker?: TMarker;
}

export class ModelInstance<T>{
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
}
