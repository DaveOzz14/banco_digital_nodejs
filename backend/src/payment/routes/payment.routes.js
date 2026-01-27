import { Router } from 'express';
import PaymentController from '../controllers/PaymentController.js';

const router = Router();
const controller = new PaymentController();

router.post('/pay', controller.pay);

export default router;
