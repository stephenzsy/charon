import {AuditReport} from '../models/audit';

export interface Auditor {
  audit(): Promise<AuditReport>;
}
