import { z } from 'zod';

// Cash only needs to know which booking is being paid.
export const cashPaymentSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
});

// Card needs the booking, the agreed service amount the client is paying,
// and the card details. The same shape the frontend card form sends.
export const cardPaymentSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
  serviceAmount: z.coerce.number().positive().max(10_000_000),
  cardholderName: z.string().min(2).max(180),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry must be MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});
