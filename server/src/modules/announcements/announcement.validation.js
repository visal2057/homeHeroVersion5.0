import { z } from 'zod';

export const announcementSchema = z
  .object({
    title: z.string().min(3).max(200),
    messageBody: z.string().min(3),
    audience: z.enum(['ALL_USERS', 'CLIENTS', 'SERVICE_PROVIDERS']),
    publicationMode: z.enum(['DRAFT', 'PUBLISH_NOW', 'SCHEDULE']),
    scheduledFor: z.string().datetime().optional().nullable(),
  })
  .refine((data) => data.publicationMode !== 'SCHEDULE' || Boolean(data.scheduledFor), {
    message: 'A future date and time is required to schedule an announcement',
    path: ['scheduledFor'],
  });
