import { z } from 'zod';

const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }).min(2),
    description: z.string().optional(),
  }),
});

export const CategoryValidation = {
  createCategorySchema,
};
