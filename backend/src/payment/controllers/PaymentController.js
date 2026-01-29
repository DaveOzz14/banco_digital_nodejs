import PaymentService from '../services/PaymentService.js';
import { tracer, logger, SeverityNumber } from '../../telemetry/instrumentation.js';
import { SpanStatusCode } from '@opentelemetry/api';

export default class PaymentController {
  constructor() {
    this.service = new PaymentService();
  }

  pay = (req, res) => {
    const span = tracer.startSpan('payment.controller.pay', {
      attributes: {
        'http.method': req.method,
        'http.route': '/api/payment/pay',
        'payment.card_number': req.body.cardNumber ? '****' + req.body.cardNumber.slice(-4) : 'unknown',
        'payment.amount': req.body.amount || 0
      }
    });

    try {
      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: 'Processing payment request',
        attributes: {
          'payment.amount': req.body.amount,
          'trace_id': span.spanContext().traceId,
          'span_id': span.spanContext().spanId
        }
      });

      const payment = this.service.processPayment(req.body);

      span.setAttributes({
        'payment.transaction_id': payment.transactionId,
        'payment.status': payment.status
      });

      logger.emit({
        severityNumber: SeverityNumber.ERROR,
        severityText: 'ERROR',
        body: `Payment failed: ${payment.message}`,
        attributes: {
          'payment.transaction_id': payment.transactionId,
          'payment.status': payment.status,
          'trace_id': span.spanContext().traceId,
          'span_id': span.spanContext().spanId
        }
      });

      span.setStatus({ code: SpanStatusCode.ERROR, message: payment.message });
      span.end();

      res.status(400).json(payment);
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.end();

      logger.emit({
        severityNumber: SeverityNumber.ERROR,
        severityText: 'ERROR',
        body: `Payment controller error: ${error.message}`,
        attributes: {
          'error.type': error.name,
          'error.message': error.message,
          'trace_id': span.spanContext().traceId,
          'span_id': span.spanContext().spanId
        }
      });

      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
