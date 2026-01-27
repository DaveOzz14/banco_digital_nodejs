export default class CreditApplication {
  constructor({ name, income, amount }) {
    this.id = `CR-${Math.floor(Math.random() * 1000000)}`;
    this.name = name;
    this.income = income;
    this.amount = amount;
    this.createdAt = new Date();
  }
}
