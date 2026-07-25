import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import {
  listNotificationsHandler,
  markAsReadHandler,
  getFeedHandler,
  markFeedItemReadHandler,
} from './notification.controller.js';

// Any logged-in user reads only their own notifications, so no role
// restriction is needed beyond being authenticated.
const router = Router();
router.use(authenticate);

router.get('/', listNotificationsHandler);
router.patch('/:notificationId/read', markAsReadHandler);

// Combined announcements + personal notifications feed used by the Client
// and Service Provider notification bells (spec §11 / §45.1 / §92).
router.get('/feed', getFeedHandler);
router.patch('/feed/:type/:id/read', markFeedItemReadHandler);

export default router;
