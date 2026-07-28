import { z } from 'zod';

export const unavailableDatesSchema = z.object({
  dates: z.array(z.coerce.date()),
});

export const manualOnlineSchema = z.object({
  manualOnline: z.boolean(),
  // Present only when the toggle is acting as a same-day override (today
  // is blocked by an unavailable period) - see availability.service.js's
  // setTodayOverride.
  todayOverride: z.boolean().optional(),
});
