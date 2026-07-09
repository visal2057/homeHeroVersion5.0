import { z } from 'zod';

// `amount` is only accepted for Cash-paid jobs -- for Card-paid jobs the
// service layer always overwrites it with the recorded payment amount and
// ignores anything submitted here.
export const generateInvoiceSchema = z.object({
  amount: z.coerce.number().positive().optional(),
});
