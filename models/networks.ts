
export interface NetworkMetadata {
  id: string;
  name: string;
  clientSecret: string;
  radiusPort: number;
}

export interface Network extends NetworkMetadata {
  radcheckTableName?: string;
  serverTlsCert?: string;
  serverTlsPrivateKey?: string;
}

export type ListNetworksResult = NetworkMetadata[];
