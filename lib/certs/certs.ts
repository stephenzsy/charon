import {CertBundle} from '../models/certs';
import certsManager from './certs-manager';

export class Certs {
  async getCaCertBundle(): Promise<CertBundle> {
    return null;
  }
}

export const certs: Certs = new Certs();

export default certs;
