import { useLocation, useNavigate } from 'react-router-dom';

export default function CreditConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.id) {
    // Protección UX (si entran directo)
    navigate('/');
    return null;
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <h2>Solicitud registrada</h2>
        <p>
          Tu solicitud de crédito fue registrada exitosamente.
        </p>

        <div className="success">
          Número de registro<br />
          <strong>{state.id}</strong>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/" className="button">
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
