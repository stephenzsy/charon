export interface CertSubjectConfig {
  commonName: string;
  emailAddress: string;
  subjectAltDnsNames?: string[];
  subjectAltIps?: string[];
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
  proxyCa: CertSubjectConfig;
  proxyServer: CertSubjectConfig;
  proxyClient: CertSubjectConfig;
  dbCa: CertSubjectConfig;
  dbServer: CertSubjectConfig;
  dbClient: CertSubjectConfig;
}
