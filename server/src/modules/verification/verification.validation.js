import { z } from 'zod';

export const rejectApplicationSchema = z.object({
  reason: z.string().min(5, 'A rejection reason is required'),
});
