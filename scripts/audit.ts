///<reference path="../typings/commander/commander.d.ts"/>
///<reference path="../typings/fs-extra/fs-extra.d.ts"/>

import 'babel-polyfill';

import {AuditReport} from '../lib/models/audit'
import {AllAuditor} from '../lib/audit/all'

const auditor: AllAuditor = new AllAuditor();
async function audit() {
  try {
    var report: AuditReport = await auditor.audit();
    console.dir(report);
  } catch (e) {
    console.error(e);
  }
}

audit();
