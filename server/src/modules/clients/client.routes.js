import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireClient } from '../../middleware/requireClient.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { uploadProfileImage } from '../../middleware/uploadFiles.js';
import {
  updateClientProfileSchema,
  updateClientLocationSchema,
  changeClientPasswordSchema,
} from './client.validation.js';
import {
  getProfileHandler,
  updateProfileHandler,
  updateProfileImageHandler,
  updateLocationHandler,
  changePasswordHandler,
} from './client.controller.js';
import {
  submitClientComplaintHandler,
  listClientComplaintsHandler,
} from '../complaints/clientComplaint.controller.js';
import { listActiveAnnouncementsHandler } from '../announcements/announcement.controller.js';

const router = Router();

router.use(authenticate, requireClient);

router.get('/profile', getProfileHandler);
router.put('/profile', validateRequest(updateClientProfileSchema), updateProfileHandler);
router.put('/profile/image', uploadProfileImage, updateProfileImageHandler);
router.put('/profile/location', validateRequest(updateClientLocationSchema), updateLocationHandler);
router.put('/profile/password', validateRequest(changeClientPasswordSchema), changePasswordHandler);

router.get('/complaints', listClientComplaintsHandler);
router.post('/complaints', submitClientComplaintHandler);

router.get('/announcements', listActiveAnnouncementsHandler);

export default router;
