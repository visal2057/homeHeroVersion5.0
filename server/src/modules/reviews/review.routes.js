import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireClient } from '../../middleware/requireClient.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { submitReviewSchema } from './review.validation.js';
import { submitReviewHandler } from './review.controller.js';

// Reviews are written by the logged-in client right after they pay.
const router = Router();
router.use(authenticate, requireClient);

router.post('/', validateRequest(submitReviewSchema), submitReviewHandler);

export default router;
