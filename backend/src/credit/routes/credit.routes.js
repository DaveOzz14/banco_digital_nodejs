import { Router } from 'express';
import CreditController from '../controllers/CreditController.js';

const router = Router();
const controller = new CreditController();

router.post('/apply', controller.apply);

export default router;
