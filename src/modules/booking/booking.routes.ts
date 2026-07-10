import express from 'express';
import { BookingController } from './booking.controller';
import { BookingValidation } from './booking.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import checkRole from '../../middlewares/checkRole';

const router = express.Router();

router.post(
  '/',
  auth(),
  checkRole('CUSTOMER'),
  validateRequest(BookingValidation.createBookingSchema),
  BookingController.createBooking
);
router.get('/', auth(), checkRole('CUSTOMER', 'TECHNICIAN'), BookingController.getUserBookings);
router.get('/:id', auth(), BookingController.getBookingById);
router.patch('/:id/cancel', auth(), checkRole('CUSTOMER'), BookingController.cancelBooking);

export const BookingRoutes = router;
