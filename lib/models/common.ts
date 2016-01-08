export interface CollectionQueryResult<T, TMarker> {
  count: number;
  items: T[];
  lastMarker?: TMarker;
}

export class ModelInstance<T>{
  protected instance: T;
  constructor(instance: T) {
    this.instance = instance;
  }
}
