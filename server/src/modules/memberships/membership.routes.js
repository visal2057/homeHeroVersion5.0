import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import { checkProviderVerification } from '../../middleware/checkProviderVerification.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { purchaseMembershipSchema } from './membership.validation.js';
import {
  getMembershipOverviewHandler,
  purchaseMembershipHandler,
} from './membership.controller.js';

// All membership actions belong to the logged-in provider.
const router = Router();
router.use(authenticate, requireProvider, checkProviderVerification);

router.get('/me', getMembershipOverviewHandler);
router.post('/purchase', validateRequest(purchaseMembershipSchema), purchaseMembershipHandler);

export default router;
