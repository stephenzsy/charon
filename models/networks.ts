
export interface NetworkMetadata {
  id: string;
  name: string;
}

export interface Network extends NetworkMetadata {
  clientSecret?: string;
  dbName?: string;
  serverTlsCert?: string;
  serverTlsPrivateKey?: string;
}

export type ListNetworksResult = NetworkMetadata[];
