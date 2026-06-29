import { z } from 'zod';

export const createBookingSchema = z.object({
  providerUserId: z.coerce.number().int().positive(),
  serviceCategoryId: z.coerce.number().int().positive(),
  jobDescription: z.string().min(10).max(1000),
  scheduledAt: z.coerce.date(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});
