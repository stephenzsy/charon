import {AuditReport, AuditStatus} from '../models/audit';
import {Auditor} from './base';
import Network from '../models/networks';
import {getRadcheckModel, sqlRadius} from '../db/index';
import {RadcheckInternal} from '../db/radcheck';

export class RadcheckEntryAuditor implements Auditor {
  private network: Network;
  private radcheck: RadcheckInternal;

  constructor(network: Network, radcheck: RadcheckInternal) {
    this.network = network;
    this.radcheck = radcheck;
  }

  async audit(): Promise<AuditReport> {
    return null;
  }
}

export class RadcheckAuditor implements Auditor {
  private radcheckTableName: string;

  constructor(network: Network) {
    this.radcheckTableName = network.radcheckTableName;
  }

  async audit(): Promise<AuditReport> {
    var model = getRadcheckModel(sqlRadius, this.radcheckTableName);
    var radchecks: RadcheckInternal[] = await model.all();
    console.log(radchecks);
    return {
      name: 'radcheck-audit-' + this.radcheckTableName,
      status: AuditStatus.Unknown,
      details: []
    }
  }
}

export function allRadcheckAuditors(): RadcheckAuditor[] {
  return Network.all().map(network => {
    return new RadcheckAuditor(network);
  });
}
