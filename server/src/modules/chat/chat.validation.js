import { z } from 'zod';

export const sendMessageSchema = z.object({
  text: z.string().trim().min(1, 'Message cannot be empty').max(2000),
});
