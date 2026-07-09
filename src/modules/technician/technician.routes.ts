import express from 'express';
import { TechnicianController } from './technician.controller';
import { TechnicianValidation } from './technician.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import checkRole from '../../middlewares/checkRole';

const router = express.Router();

// Public browse routes
router.get('/technicians', TechnicianController.getAllTechnicians);
router.get('/technicians/:id', TechnicianController.getTechnicianById);

// Technician self-management routes
router.put(
  '/technician/profile',
  auth(),
  checkRole('TECHNICIAN'),
  validateRequest(TechnicianValidation.updateProfileSchema),
  TechnicianController.updateProfile
);
router.put(
  '/technician/availability',
  auth(),
  checkRole('TECHNICIAN'),
  validateRequest(TechnicianValidation.updateAvailabilitySchema),
  TechnicianController.updateAvailability
);
router.get(
  '/technician/bookings',
  auth(),
  checkRole('TECHNICIAN'),
  TechnicianController.getTechnicianBookings
);
router.patch(
  '/technician/bookings/:id',
  auth(),
  checkRole('TECHNICIAN'),
  validateRequest(TechnicianValidation.updateBookingStatusSchema),
  TechnicianController.updateBookingStatus
);

export const TechnicianRoutes = router;
