import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  role: z.enum(['CLIENT', 'SERVICE_PROVIDER']).optional(),
  search: z.string().optional(),
  bookingId: z.string().optional(),
});
