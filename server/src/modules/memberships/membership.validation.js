import { z } from 'zod';

// Buying/renewing a membership only needs card details — the price is
// decided by the backend, so the provider never sends an amount.
export const purchaseMembershipSchema = z.object({
  cardholderName: z.string().min(2).max(180),
  cardNumber: z.string().regex(/^\d{16}$/, 'Card number must be 16 digits'),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Expiry must be MM/YY'),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});
