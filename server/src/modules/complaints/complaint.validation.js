import { z } from 'zod';

export const verdictSchema = z.object({
  investigationNotes: z.string().optional(),
  verdictText: z.string().min(3, 'A final verdict is required'),
  banRecommendations: z
    .array(
      z.object({
        userId: z.coerce.number().int().positive(),
        banType: z.enum(['TEMPORARY', 'PERMANENT']),
        endsAt: z.string().datetime().optional().nullable(),
        reason: z.string().min(3),
      }),
    )
    .default([]),
});
