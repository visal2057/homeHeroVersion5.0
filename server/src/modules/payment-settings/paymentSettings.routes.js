import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { savePaymentSettingsSchema } from './paymentSettings.validation.js';
import {
  getPaymentSettingsHandler,
  savePaymentSettingsHandler,
} from './paymentSettings.controller.js';

// Only a provider manages their own payment settings, so every route runs
// through authenticate + requireProvider. The provider is taken from the
// token (req.user.userId), never from the request body.
const router = Router();
router.use(authenticate, requireProvider);

router.get('/', getPaymentSettingsHandler);
router.put('/', validateRequest(savePaymentSettingsSchema), savePaymentSettingsHandler);

export default router;
