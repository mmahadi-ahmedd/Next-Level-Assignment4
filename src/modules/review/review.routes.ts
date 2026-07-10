import express from 'express';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import checkRole from '../../middlewares/checkRole';

const router = express.Router();

router.post(
  '/',
  auth(),
  checkRole('CUSTOMER'),
  validateRequest(ReviewValidation.createReviewSchema),
  ReviewController.createReview
);

export const ReviewRoutes = router;
