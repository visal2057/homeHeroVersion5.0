import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireSystemAdmin } from '../../middleware/requireSystemAdmin.js';
import { searchSPTrackingHandler } from './sp-tracking.controller.js';

const router = Router();

router.use(authenticate, requireSystemAdmin);
router.get('/', searchSPTrackingHandler);

export default router;
