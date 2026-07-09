import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import {
  getInvoiceStatusHandler,
  generateInvoiceHandler,
  downloadInvoiceHandler,
  listMyInvoicesHandler,
} from './invoice.controller.js';

// Only the owning provider generates/downloads their own invoices, so
// every route runs through authenticate + requireProvider first.
const router = Router();
router.use(authenticate, requireProvider);

router.get('/mine', listMyInvoicesHandler);
router.get('/booking/:bookingId', getInvoiceStatusHandler);
router.post('/booking/:bookingId/generate', generateInvoiceHandler);
router.get('/booking/:bookingId/download', downloadInvoiceHandler);

export default router;
