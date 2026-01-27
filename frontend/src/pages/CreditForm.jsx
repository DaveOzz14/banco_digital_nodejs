import { useNavigate } from 'react-router-dom';

export default function CreditForm() {
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:3001/api/credit/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: e.target.name.value,
        income: e.target.income.value,
        amount: e.target.amount.value
      })
    });

    const data = await res.json();

    navigate('/credit/confirmation', {
      state: { id: data.id }
    });
  };

  return (
    <div className="container">
      <form className="form" onSubmit={submit}>
        <h2>Solicitud de Crédito</h2>

        <input name="name" placeholder="Nombre completo" required />
        <input name="income" placeholder="Ingreso mensual" required />
        <input name="amount" placeholder="Monto solicitado" required />

        <button className="button">Enviar solicitud</button>
      </form>
    </div>
  );
}
