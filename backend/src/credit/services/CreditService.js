import CreditApplication from '../models/CreditApplication.js';

export default class CreditService {
  createApplication(data) {
    return new CreditApplication(data);
  }
}
