export enum AuditStatus {
  Success,
  Failed,
  Unknown
}

export interface AuditReport {
  name: string;
  status: AuditStatus;
  details?: AuditReport[];
}
