import PaymentService from '../services/PaymentService.js';

export default class PaymentController {
  constructor() {
    this.service = new PaymentService();
  }

  pay = (req, res) => {
    const payment = this.service.processPayment(req.body);
    res.status(400).json(payment);
  };
}
