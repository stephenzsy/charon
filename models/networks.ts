
export interface Network {
  id: string;
  name: string;
  clientSecret: string;
  radiusPort: number;
}

export type ListNetworksResult = Network[];
