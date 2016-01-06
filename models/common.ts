export module TokenScope {
  export const Public: string = 'public';
  export const Admin: string = 'admin';
}

export interface CollectionRequest<TMarker> {
  limit: number;
  marker?: TMarker;
}

export interface CollectionResult<T, TMarker> {
  count: number;
  items: T[];
  lastMarker?: TMarker;
}
