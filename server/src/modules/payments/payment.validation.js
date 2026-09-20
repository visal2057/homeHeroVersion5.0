import { z } from 'zod';

// Cash only needs to know which booking is being paid.
export const cashPaymentSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
});

// Card needs the booking, the agreed service amount the client is paying,
// and the card details. The same shape the frontend card form sends.
// serviceAmount is client-entered by design (spec 18.2: "the original
// service amount agreed with the Service Provider" isn't a price HomeHero
// sets or stores anywhere else) - the 5% fee and total are still always
// computed from it on the backend (payment.service.js), never trusted from
// the client. This schema only tightens the shape of that input: a real
// monetary value, to two decimal places, within a sane upper bound.
export const cardPaymentSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
  serviceAmount: z.coerce.number().positive().max(10_000_000)
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
  cardholderName: z.string().min(2).max(180),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry must be MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});
