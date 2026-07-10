import { z } from 'zod';

const createServiceSchema = z.object({
  body: z.object({
    categoryId: z.number({ required_error: 'categoryId is required' }).int(),
    title: z.string({ required_error: 'Title is required' }).min(3),
    description: z.string({ required_error: 'Description is required' }).min(10),
    price: z.number({ required_error: 'Price is required' }).min(0),
  }),
});

const updateServiceSchema = z.object({
  body: z.object({
    categoryId: z.number().int().optional(),
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    price: z.number().min(0).optional(),
  }),
});

export const ServiceValidation = {
  createServiceSchema,
  updateServiceSchema,
};
