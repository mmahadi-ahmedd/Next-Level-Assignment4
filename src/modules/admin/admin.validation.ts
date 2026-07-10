import { z } from 'zod';

const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'BANNED'], { required_error: 'status is required' }),
  }),
});

export const AdminValidation = {
  updateUserStatusSchema,
};
