import { z } from 'zod';

export const unavailableDatesSchema = z.object({
  dates: z.array(z.coerce.date()),
});

export const manualOnlineSchema = z.object({
  manualOnline: z.boolean(),
});
