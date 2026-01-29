import { useNavigate } from 'react-router-dom';
import { tracer } from '../telemetry/instrumentation.js';

export default function Login() {
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    
    const span = tracer.startSpan('user.login', {
      attributes: {
        'user.action': 'login',
        'ui.component': 'Login',
        'ui.event': 'form_submit'
      }
    });

    span.addEvent('login_form_submitted');
    span.end();

    navigate('/Home');
  };

  return (
    <div className="container">
      <form className="form" onSubmit={submit}>
        <h2>Ingreso a Banca Digital</h2>

        <input placeholder="Usuario" required />
        <input type="password" placeholder="Contraseña" required />

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="button">Ingresar</button>
        </div>
      </form>
    </div>
  );
}
