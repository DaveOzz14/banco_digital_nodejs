export default class Payment {
  constructor({ cardNumber, amount }) {
    this.transactionId = `TX-${Math.floor(Math.random() * 1000000)}`;
    this.status = 'FAILED';
    this.message = 'Payment rejected by bank';
  }
}
