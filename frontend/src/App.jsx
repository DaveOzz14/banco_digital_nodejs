import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreditForm from './pages/CreditForm';
import CreditConfirmation from './pages/CreditConfirmation';
import PaymentForm from './pages/PaymentForm';
import PaymentError from './pages/PaymentError';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/credit" element={<CreditForm />} />
      <Route path="/credit/confirmation" element={<CreditConfirmation />} />
      <Route path="/payment" element={<PaymentForm />} />
      <Route path="/payment/error" element={<PaymentError />} />
    </Routes>
  );
}
