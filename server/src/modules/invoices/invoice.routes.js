import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorizeRoles } from '../../middleware/authorizeRoles.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { generateInvoiceSchema } from './invoice.validation.js';
import {
  getInvoiceFormHandler,
  generateInvoiceHandler,
  downloadInvoiceHandler,
} from './invoice.controller.js';

const router = Router();

router.get(
  '/:bookingId/form',
  authenticate,
  authorizeRoles('SERVICE_PROVIDER'),
  getInvoiceFormHandler,
);

router.post(
  '/:bookingId',
  authenticate,
  authorizeRoles('SERVICE_PROVIDER'),
  validateRequest(generateInvoiceSchema),
  generateInvoiceHandler,
);

router.get(
  '/:bookingId/download',
  authenticate,
  authorizeRoles('SERVICE_PROVIDER', 'SYSTEM_ADMIN'),
  downloadInvoiceHandler,
);

export default router;
