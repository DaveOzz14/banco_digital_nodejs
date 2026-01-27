export default function Home() {
  return (
    <div className="container">
      <div className="header">
        <h1>Banco Digital</h1>
      </div>

      <div className="products">
        <div className="card">
          <h2>Crédito Hipotecario</h2>
          <p>
            Solicita tu crédito de vivienda de forma rápida, segura y 100%
            digital.
          </p>
          <a href="/credit" className="button">
            Solicitar
          </a>
        </div>

        <div className="card">
          <h2>Tarjeta de Crédito</h2>
          <p>
            Realiza el pago de tu tarjeta de crédito de manera inmediata.
          </p>
          <a href="/payment" className="button">
            Pagar
          </a>
        </div>
      </div>

      <div className="footer">
        © 2026 Banco Digital – Todos los derechos reservados
      </div>
    </div>
  );
}

