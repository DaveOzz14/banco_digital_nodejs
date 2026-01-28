import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import CreditForm from './pages/CreditForm';
import CreditConfirmation from './pages/CreditConfirmation';
import PaymentForm from './pages/PaymentForm';
import PaymentError from './pages/PaymentError';

export default function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login />} />

      {/* Home */}
      <Route path="/Home" element={<Home />} />

      {/* Negocio Crédito */}
      <Route path="/credit" element={<CreditForm />} />
      <Route path="/credit/confirmation" element={<CreditConfirmation />} />

      {/* Negocio Pago */}
      <Route path="/payment" element={<PaymentForm />} />
      <Route path="/payment/error" element={<PaymentError />} />
    </Routes>
  );
}
