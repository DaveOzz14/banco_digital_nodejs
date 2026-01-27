import { useNavigate } from 'react-router-dom';

export default function PaymentForm() {
  const navigate = useNavigate();

  const pay = async () => {
    const res = await fetch('http://localhost:3001/api/payment/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardNumber: '4111111111111111',
        amount: 100000
      })
    });

    const data = await res.json();

    navigate('/payment/error', {
      state: {
        message: data.message,
        transactionId: data.transactionId
      }
    });
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
