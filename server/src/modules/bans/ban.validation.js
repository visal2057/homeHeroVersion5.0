import { z } from 'zod';

export const applyBanSchema = z.object({
  userId: z.coerce.number().int().positive(),
  banType: z.enum(['TEMPORARY', 'PERMANENT']),
  endsAt: z.string().datetime().optional().nullable(),
  reason: z.string().min(3, 'A ban reason is required'),
  sourceBanRequestId: z.coerce.number().int().positive().optional().nullable(),
});
