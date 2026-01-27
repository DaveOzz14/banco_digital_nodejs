import express from 'express';
import cors from 'cors';
import creditRoutes from './credit/routes/credit.routes.js';
import paymentRoutes from './payment/routes/payment.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/credit', creditRoutes);
app.use('/api/payment', paymentRoutes);

export default app;
