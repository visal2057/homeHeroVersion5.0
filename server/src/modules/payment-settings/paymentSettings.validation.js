import { z } from 'zod';

// What the provider's payment-settings form sends. The account number is
// kept as a string of digits (leading zeros matter for bank accounts).
export const savePaymentSettingsSchema = z.object({
  accountNumber: z.string().regex(/^\d{6,20}$/, 'Account number must be 6-20 digits'),
  bankName: z.string().min(2).max(150),
  branchName: z.string().min(2).max(150),
  accountHolderName: z.string().min(2).max(180),
});
