
export interface NetworkMetadata {
  id: string;
  name: string;
}

export interface Network extends NetworkMetadata {
  clientSecret: string;
  dbName: string;
}

export type ListNetworksResult = NetworkMetadata[];
