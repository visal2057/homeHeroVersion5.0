import { z } from 'zod';

// A review needs the booking, a 1-5 star rating, and some text.
// The rating bounds match the CHECK constraint on the reviews table.
export const submitReviewSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  reviewText: z.string().min(1).max(2000),
});
