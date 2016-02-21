export interface CertSubjectConfig {
  commonName: string;
  emailAddress: string;
}

export interface CaCertSubjectConfig extends CertSubjectConfig {
  country: string;
  stateOrProviceName: string;
  localityName: string;
  organizationName: string;
  organizationUnitName: string;
}

export interface InitCertsConfig {
  ca: CaCertSubjectConfig;
  siteCa: CertSubjectConfig;
  siteServer: CertSubjectConfig;
}
