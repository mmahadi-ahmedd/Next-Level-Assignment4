import { z } from 'zod';

const createPaymentSchema = z.object({
  body: z.object({
    bookingId: z.number({ required_error: 'bookingId is required' }).int(),
  }),
});

export const PaymentValidation = {
  createPaymentSchema,
};
