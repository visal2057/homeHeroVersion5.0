import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import { authorizeRoles } from '../../middleware/authorizeRoles.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { generateInvoiceSchema } from './invoice.validation.js';
import {
  getInvoiceFormHandler,
  generateInvoiceHandler,
  downloadInvoiceHandler,
} from './invoice.controller.js';

// Mounted at /api/provider/invoices (see app.js), alongside the other
// provider-scoped booking routers.
const router = Router();
router.use(authenticate);

router.get('/:bookingId/form', requireProvider, getInvoiceFormHandler);
router.post('/:bookingId', requireProvider, validateRequest(generateInvoiceSchema), generateInvoiceHandler);

// Also reachable by System Admin, for the SP Tracking page's View Invoice action.
router.get('/:bookingId/download', authorizeRoles('SERVICE_PROVIDER', 'SYSTEM_ADMIN'), downloadInvoiceHandler);

export default router;
