import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import { checkProviderVerification } from '../../middleware/checkProviderVerification.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { unavailableDatesSchema, manualOnlineSchema } from './availability.validation.js';
import {
  toggleAvailabilityHandler,
  getUnavailableDatesHandler,
  putUnavailableDatesHandler,
} from './availability.controller.js';

const router = Router();
router.use(authenticate, requireProvider, checkProviderVerification);

router.patch('/availability', validateRequest(manualOnlineSchema), toggleAvailabilityHandler);
router.get('/unavailable-dates', getUnavailableDatesHandler);
router.put('/unavailable-dates', validateRequest(unavailableDatesSchema), putUnavailableDatesHandler);

export default router;
