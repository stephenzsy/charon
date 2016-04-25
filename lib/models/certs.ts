'use strict';

import {CertSubjectConfig, CaCertSubjectConfig} from '../../models/init';
import Constants from '../constants';
import {UserModel, PasswordModel, CertModel} from '../db/index';
import {ModelInstance} from './common';
import {CertInstance, CertInternal, CertTypeStr, CertStateStr} from '../db/certs';
import {UserInstance} from '../db/users';
import {Network} from './networks';
import User from './users';

export interface CertBundle {
  certificateBody: string;
  privateKey: string;
  certificateChain: string;
}

export interface CertFileBundle {
  bundleDirectory: string;
  certificateFile: string;
  privateKeyFile: string;
  certificateChainFile: string;
  exportPkcs12File?: string;
  exportPkcs12Password?: string;
}

export class CertSubject {
  country: string;
  stateOrProviceName: string;
  localityName: string;
  organizationName: string;
  organizationUnitName: string;
  commonName: string;
  emailAddress: string;

  constructor(ca: CaCertSubjectConfig, config: CertSubjectConfig = ca) {
    this.country = ca.country;
    this.stateOrProviceName = ca.stateOrProviceName;
    this.localityName = ca.localityName;
    this.organizationName = ca.organizationName;
    this.organizationUnitName = ca.organizationUnitName;
    this.commonName = config.commonName;
    this.emailAddress = config.emailAddress;
  }

  get subject(): string {
    var subj: string = '';
    if (this.country) {
      subj += '/C=' + this.country.trim();
    }
    if (this.stateOrProviceName) {
      subj += '/ST=' + this.stateOrProviceName.trim()
    }
    if (this.localityName) {
      subj += '/L=' + this.localityName.trim();
    }
    if (this.organizationName) {
      subj += '/O=' + this.organizationName.trim();
    }
    if (this.organizationUnitName) {
      subj += '/OU=' + this.organizationUnitName.trim();
    }
    if (this.commonName) {
      subj += '/CN=' + this.commonName.trim();
    }
    if (this.emailAddress) {
      subj += '/emailAddress=' + this.emailAddress.trim();
    }
    return subj;
  }
}

export enum CertType {
  CA,
  Site,
  Server,
  Client
}

export function certTypeToStr(type: CertType): string {
  switch (type) {
    case CertType.CA:
      return CertTypeStr.CA;
    case CertType.Site:
      return CertTypeStr.Site;
    case CertType.Server:
      return CertTypeStr.Server;
    case CertType.Client:
      return CertTypeStr.Client;
  }
  throw 'Unknown CertType: ' + type;
}

export class Cert extends ModelInstance<CertInstance> {

  async getUser(): Promise<User> {
    var userInstance: UserInstance = await this.instance.getUser();
    if (userInstance) {
      return new User(userInstance);
    }
    return null;
  }

  static async findBySerial(serial: number): Promise<Cert> {
    var instance: CertInstance = await CertModel.findById(serial);
    if (instance) {
      return new Cert(instance);
    }
    return null;
  }

  async markAsActive(): Promise<Cert> {
    this.instance.state = CertStateStr.Active;
    await this.instance.save();
    return this;
  }

  async delete(): Promise<void> {
    return this.instance.destroy();
  }

  static async createPending(type: CertType, subject: string, network: Network, user: User): Promise<Cert> {
    var instance: CertInstance = await CertModel.create(<CertInternal>{
      type: certTypeToStr(type),
      state: CertStateStr.Pending,
      networkId: network ? network.id : Constants.UUID0,
      subject: subject
    });
    instance = await instance.setUser(user.instance);
    return new Cert(instance);
  }

  static async clearAllServerCerts(): Promise<void> {
    await CertModel.destroy({ where: { type: CertTypeStr.Server } });
  }
}

export default Cert;
