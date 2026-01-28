import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
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
