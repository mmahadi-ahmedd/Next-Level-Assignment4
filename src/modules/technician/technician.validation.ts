import { z } from 'zod';

const updateProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    experienceYears: z.number().int().min(0).optional(),
    hourlyRate: z.number().min(0).optional(),
    location: z.string().min(2).optional(),
  }),
});

const updateAvailabilitySchema = z.object({
  body: z.object({
    slots: z
      .array(
        z.object({
          dayOfWeek: z.number().int().min(0).max(6),
          startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
          endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format'),
        })
      )
      .min(1, 'At least one availability slot is required'),
  }),
});

const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED'], {
      required_error: 'Status is required',
    }),
  }),
});

export const TechnicianValidation = {
  updateProfileSchema,
  updateAvailabilitySchema,
  updateBookingStatusSchema,
};
