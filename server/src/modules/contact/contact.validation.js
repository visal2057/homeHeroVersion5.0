import { z } from 'zod';

export const contactMessageSchema = z.object({
  fullName: z.string().min(2).max(150),
  email: z.string().email(),
  subject: z.string().min(2).max(200),
  messageBody: z.string().min(10).max(2000),
});
