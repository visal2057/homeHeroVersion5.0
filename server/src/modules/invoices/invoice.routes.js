import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import { checkProviderVerification } from '../../middleware/checkProviderVerification.js';
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

router.get('/:bookingId/form', requireProvider, checkProviderVerification, getInvoiceFormHandler);
router.post(
  '/:bookingId',
  requireProvider,
  checkProviderVerification,
  validateRequest(generateInvoiceSchema),
  generateInvoiceHandler,
);

// Also reachable by System Admin (SP Tracking's View Invoice action) and by the
// owning Client (My Bookings > Completed Jobs > Download Invoice). Ownership for
// both the provider and the client is enforced in invoice.service.js.
router.get(
  '/:bookingId/download',
  authorizeRoles('SERVICE_PROVIDER', 'SYSTEM_ADMIN', 'CLIENT'),
  checkProviderVerification,
  downloadInvoiceHandler,
);

export default router;
