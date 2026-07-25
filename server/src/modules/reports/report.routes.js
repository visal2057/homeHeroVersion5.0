import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireSystemAdmin } from '../../middleware/requireSystemAdmin.js';
import { generateEarningsReportHandler, generateSpReportHandler } from './report.controller.js';

const router = Router();

router.use(authenticate, requireSystemAdmin);
router.get('/earnings', generateEarningsReportHandler);
router.get('/sp', generateSpReportHandler);

export default router;
