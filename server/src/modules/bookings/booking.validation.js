import { z } from 'zod';

export const createBookingSchema = z.object({
  providerUserId: z.coerce.number().int().positive(),
  serviceCategoryId: z.coerce.number().int().positive(),
  jobDescription: z.string().min(10).max(1000),
  scheduledAt: z.coerce.date(),
  scheduledEndAt: z.coerce.date(),
  locationLatitude: z.coerce.number().min(-90).max(90).optional(),
  locationLongitude: z.coerce.number().min(-180).max(180).optional(),
  locationAddress: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const rejectBookingSchema = z.object({
  reason: z.string().min(1, 'A reason is required').max(500),
});

export const proposeRescheduleSchema = z.object({
  scheduledAt: z.coerce.date(),
  scheduledEndAt: z.coerce.date(),
});
