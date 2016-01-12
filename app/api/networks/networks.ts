import * as express from 'express';
import * as validator from 'validator';

import {SyncActionEnactor, HandlerUtils} from '../../../lib/event/event-handler';
import {Network} from '../../../lib/models/networks';
import {NetworkMetadata, ListNetworksResult} from '../../../models/networks';

class ListNetworksEnactor extends SyncActionEnactor<void, ListNetworksResult> {
  public enactSync(req: void): ListNetworksResult {
    return Network.all.map((network: Network): NetworkMetadata => {
      return {
        id: network.id,
        name: network.name
      };
    });
  }
}

export module Handlers {
  export const listNetworksHandler = HandlerUtils.newRequestHandler<void, ListNetworksResult>({
    requireAdminAuthoriztaion: true,
    requestDeserializer: (req: express.Request): void => { },
    enactor: new ListNetworksEnactor()
  });
}
//# sourceMappingURL=networks.js.map
