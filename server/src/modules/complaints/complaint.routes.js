import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireVerificationAdmin } from '../../middleware/requireVerificationAdmin.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { verdictSchema } from './complaint.validation.js';
import { listComplaintsHandler, getComplaintDetailHandler, submitVerdictHandler } from './adminComplaint.controller.js';

const router = Router();

router.use(authenticate, requireVerificationAdmin);
router.get('/', listComplaintsHandler);
router.get('/:complaintId', getComplaintDetailHandler);
router.post('/:complaintId/verdict', validateRequest(verdictSchema), submitVerdictHandler);

export default router;
