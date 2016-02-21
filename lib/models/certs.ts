'use strict';

import {CertSubjectConfig, CaCertSubjectConfig} from '../../models/init';
import Constants from '../constants';
import {UserModel, PasswordModel, CertModel} from '../db/index';
import {ModelInstance} from './common';
import {CertInstance, CertInternal, CertTypeStr, CertStateStr} from '../db/certs';
import {Network} from './networks';
import {User} from './users';

export interface CertConfig {
  subject?: string;
  certificateMetadata?: string;
  certificatePemFile: string;
  privateKeyPemFile: string;
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

export class CertBundle {
  private _certificatePemFile: string;
  private _certificateMetadata: string;
  private _privateKeyPemFile: string;
  private _certificateSubject: string;

  constructor(config: CertConfig) {
    this._certificatePemFile = config.certificatePemFile;
    this._certificateMetadata = config.certificateMetadata;
    this._privateKeyPemFile = config.privateKeyPemFile;
    this._certificateSubject = config.subject;
  }

  get certificateMetadata(): string {
    return this._certificateMetadata;
  }

  get certificatePemFile(): string {
    return this._certificatePemFile;
  }

  get certificateSubject(): string {
    return this._certificateSubject;
  }

  get privateKeyPemFile(): string {
    return this._privateKeyPemFile;
  }
}

export enum CertType {
  CA,
  Site,
  Server,
  Client
}

function certTypeToStr(type: CertType): string {
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

  async markAsActive(): Promise<Cert> {
    this.instance.state = CertStateStr.Active;
    await this.instance.save();
    return this;
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
