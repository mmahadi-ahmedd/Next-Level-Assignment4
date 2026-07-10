import { z } from 'zod';

const createBookingSchema = z.object({
  body: z.object({
    serviceId: z.number({ required_error: 'serviceId is required' }).int(),
    scheduledAt: z.string({ required_error: 'scheduledAt is required' }).datetime({
      message: 'scheduledAt must be a valid ISO date string',
    }),
    address: z.string({ required_error: 'Address is required' }).min(5),
    notes: z.string().optional(),
  }),
});

export const BookingValidation = {
  createBookingSchema,
};