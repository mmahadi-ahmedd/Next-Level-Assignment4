import express from 'express';
import { PaymentController } from './payment.controller';
import { PaymentValidation } from './payment.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import checkRole from '../../middlewares/checkRole';

const router = express.Router();

router.post(
  '/create',
  auth(),
  checkRole('CUSTOMER'),
  validateRequest(PaymentValidation.createPaymentSchema),
  PaymentController.createPaymentSession
);
router.post(
  '/confirm',
  auth(),
  checkRole('CUSTOMER'),
  validateRequest(PaymentValidation.createPaymentSchema),
  PaymentController.confirmPayment
);
router.get('/', auth(), PaymentController.getUserPayments);
router.get('/:id', auth(), PaymentController.getPaymentById);

export const PaymentRoutes = router;
