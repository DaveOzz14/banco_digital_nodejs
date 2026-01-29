import { useNavigate } from 'react-router-dom';
import { tracer } from '../telemetry/instrumentation.js';
import { SpanStatusCode } from '@opentelemetry/api';

export default function PaymentForm() {
  const navigate = useNavigate();

  const pay = async () => {
    const span = tracer.startSpan('payment.form.pay_button', {
      attributes: {
        'user.action': 'pay_credit_card',
        'ui.component': 'PaymentForm',
        'ui.event': 'button_click',
        'payment.amount': 100000
      }
    });

    try {
      span.addEvent('payment_api_call_initiated');

      const res = await fetch('http://localhost:3001/api/payment/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardNumber: '4111111111111111',
          amount: 100000
        })
      });

      const data = await res.json();

      span.setAttributes({
        'payment.transaction_id': data.transactionId,
        'payment.status': data.status,
        'http.status_code': res.status
      });

      if (res.status !== 200) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: data.message });
        span.addEvent('payment_failed', {
          'error.message': data.message,
          'transaction.id': data.transactionId
        });
      }

      span.end();

      navigate('/payment/error', {
        state: {
          message: data.message,
          transactionId: data.transactionId
        }
      });
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      span.end();
      console.error('Payment error:', error);
    }
  };

  return (
    <div className="container">
      <div className="form">
        <h2>Pago Tarjeta de Crédito</h2>

        <h1>TC XXXX XXXX XXXX 2156</h1>
        <h1>Pago mínimo: $200.000 COP</h1>
        <h1>Fecha de pago: 30 Marzo 2026</h1>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="button" onClick={pay}>
            Pagar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
