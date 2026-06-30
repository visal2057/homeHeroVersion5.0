import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireSystemAdmin } from '../../middleware/requireSystemAdmin.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { announcementSchema } from './announcement.validation.js';
import {
  listAnnouncementsHandler,
  createAnnouncementHandler,
  updateAnnouncementHandler,
  archiveAnnouncementHandler,
  listActiveAnnouncementsHandler,
  markAnnouncementReadHandler,
} from './announcement.controller.js';

const router = Router();

router.get('/active', authenticate, listActiveAnnouncementsHandler);
router.post('/:announcementId/read', authenticate, markAnnouncementReadHandler);

router.use(authenticate, requireSystemAdmin);
router.get('/', listAnnouncementsHandler);
router.post('/', validateRequest(announcementSchema), createAnnouncementHandler);
router.put('/:announcementId', validateRequest(announcementSchema), updateAnnouncementHandler);
router.patch('/:announcementId/archive', archiveAnnouncementHandler);

export default router;
