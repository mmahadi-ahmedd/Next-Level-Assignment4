import { z } from 'zod';

const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.number({ required_error: 'bookingId is required' }).int(),
    rating: z
      .number({ required_error: 'rating is required' })
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5'),
    comment: z.string().max(1000).optional(),
  }),
});

export const ReviewValidation = {
  createReviewSchema,
};
