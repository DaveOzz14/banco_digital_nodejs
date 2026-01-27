import Payment from '../models/Payment.js';

export default class PaymentService {
  processPayment(data) {
    return new Payment(data); // error hardcodeado
  }
}
