import { useLocation, useNavigate } from 'react-router-dom';
import { tracer } from '../telemetry/instrumentation.js';
import { useEffect } from 'react';

export default function PaymentError() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (state?.transactionId) {
      const span = tracer.startSpan('page.payment_error.view', {
        attributes: {
          'ui.component': 'PaymentError',
          'ui.action': 'page_view',
          'payment.transaction_id': state.transactionId,
          'payment.error_message': state.message
        }
      });
      span.addEvent('payment_error_page_displayed');
      span.end();
    }
  }, [state]);

  if (!state?.message) {
    navigate('/');
    return null;
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h2>Error en el pago</h2>

        <p>
          No fue posible procesar el pago de tu tarjeta de crédito.
        </p>

        <div className="error">
          {state.message}
          <br />
          <small>ID Transacción: {state.transactionId}</small>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            className="button"
            onClick={() => navigate('/Home')}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
