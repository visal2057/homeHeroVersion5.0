import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireSystemAdmin } from '../../middleware/requireSystemAdmin.js';
import { generateEarningsReportHandler } from './report.controller.js';

const router = Router();

router.use(authenticate, requireSystemAdmin);
router.get('/earnings', generateEarningsReportHandler);

export default router;
