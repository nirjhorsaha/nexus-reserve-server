import express from 'express';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.get('/confirmation', PaymentController.confirmationController);

export const PaymentRoutes = router;
