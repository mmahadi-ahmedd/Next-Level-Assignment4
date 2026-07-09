import express from 'express';
import { CategoryController } from './category.controller';
import auth from '../../middlewares/auth';
import checkRole from '../../middlewares/checkRole';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';

const router = express.Router();

router.get('/', CategoryController.getAllCategories);
router.post(
  '/',
  auth(),
  checkRole('ADMIN'),
  validateRequest(CategoryValidation.createCategorySchema),
  CategoryController.createCategory
);

export const CategoryRoutes = router;
