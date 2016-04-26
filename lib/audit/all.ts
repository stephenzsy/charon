import {AuditReport, AuditStatus} from '../models/audit';
import {Auditor} from './base';
import {RadcheckAuditor, allRadcheckAuditors} from './radcheck';

export class AllAuditor implements Auditor {
  private radcheckAuditors: RadcheckAuditor[] = allRadcheckAuditors();

  constructor() {
  }

  async audit(): Promise<AuditReport> {
    var details: AuditReport[] = [];
    var radcheckReports: AuditReport[] = await Promise.all(
      this.radcheckAuditors.map((auditor: RadcheckAuditor) => {
        return auditor.audit();
      }));
    details = details.concat(radcheckReports);
    return {
      name: "all",
      status: AuditStatus.Unknown,
      details: details
    };
  }
}
