import express from 'express';
import { ServiceController } from './service.controller';
import auth from '../../middlewares/auth';
import checkRole from '../../middlewares/checkRole';
import validateRequest from '../../middlewares/validateRequest';
import { ServiceValidation } from './service.validation';


const router = express.Router();

router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getServiceById);
router.post(
  '/',
  auth(),
  checkRole('TECHNICIAN'),
  validateRequest(ServiceValidation.createServiceSchema),
  ServiceController.createService
);
router.put(
  '/:id',
  auth(),
  checkRole('TECHNICIAN'),
  validateRequest(ServiceValidation.updateServiceSchema),
  ServiceController.updateService
);
router.delete('/:id', auth(), checkRole('TECHNICIAN'), ServiceController.deleteService);

export const ServiceRoutes = router;

