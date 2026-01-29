import Payment from '../models/Payment.js';
import { tracer, logger, SeverityNumber } from '../../telemetry/instrumentation.js';

export default class PaymentService {
  processPayment(data) {
    const span = tracer.startSpan('payment.service.process', {
      attributes: {
        'payment.amount': data.amount || 0,
        'payment.card_last4': data.cardNumber ? data.cardNumber.slice(-4) : 'unknown'
      }
    });

    try {
      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: 'Processing payment in service layer',
        attributes: {
          'payment.amount': data.amount,
          'trace_id': span.spanContext().traceId,
          'span_id': span.spanContext().spanId
        }
      });

      const payment = new Payment(data);

      span.setAttributes({
        'payment.transaction_id': payment.transactionId,
        'payment.status': payment.status
      });

      span.end();
      return payment;
    } catch (error) {
      span.recordException(error);
      span.end();
      throw error;
    }
  }
}
