import CreditService from '../services/CreditService.js';

export default class CreditController {
  constructor() {
    this.service = new CreditService();
  }

  apply = (req, res) => {
    const application = this.service.createApplication(req.body);
    res.status(201).json(application);
  };
}
