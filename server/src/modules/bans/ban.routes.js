import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireSystemAdmin } from '../../middleware/requireSystemAdmin.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { applyBanSchema } from './ban.validation.js';
import { listBanRequestsHandler, applyBanHandler, removeBanHandler } from './ban.controller.js';

const router = Router();

router.use(authenticate, requireSystemAdmin);
router.get('/requests', listBanRequestsHandler);
router.post('/', validateRequest(applyBanSchema), applyBanHandler);
router.delete('/:userBanId', removeBanHandler);

export default router;
