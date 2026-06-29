import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireVerificationAdmin } from '../../middleware/requireVerificationAdmin.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { rejectApplicationSchema } from './verification.validation.js';
import {
  listPendingHandler,
  getDetailHandler,
  getDocumentHandler,
  approveHandler,
  rejectHandler,
} from './verification.controller.js';

const router = Router();

router.use(authenticate, requireVerificationAdmin);
router.get('/applications', listPendingHandler);
router.get('/applications/:applicationId', getDetailHandler);
router.get('/documents/:documentId', getDocumentHandler);
router.post('/applications/:applicationId/approve', approveHandler);
router.post('/applications/:applicationId/reject', validateRequest(rejectApplicationSchema), rejectHandler);

export default router;
