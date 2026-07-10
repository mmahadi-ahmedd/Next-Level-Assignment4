import express from 'express';
import auth from '../../middlewares/auth';
import checkRole from '../../middlewares/checkRole';
import { AdminController } from './admin.controller';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import { CategoryValidation } from '../category/category.validation';
import { CategoryController } from '../category/category.controller';

const router = express.Router();

router.use(auth(), checkRole('ADMIN'));

router.get('/users', AdminController.getAllUsers);
router.patch(
  '/users/:id',
  validateRequest(AdminValidation.updateUserStatusSchema),
  AdminController.updateUserStatus
);
router.get('/bookings', AdminController.getAllBookings);
router.get('/categories', AdminController.getAllCategories);
router.post(
  '/categories',
  validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);

export const AdminRoutes = router;