import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireSystemAdmin } from '../../middleware/requireSystemAdmin.js';
import { listUsersHandler } from './user.controller.js';

const router = Router();

router.use(authenticate, requireSystemAdmin);
router.get('/', listUsersHandler);

export default router;
