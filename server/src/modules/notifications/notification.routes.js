import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { listNotificationsHandler, markAsReadHandler } from './notification.controller.js';

// Any logged-in user reads only their own notifications, so no role
// restriction is needed beyond being authenticated.
const router = Router();
router.use(authenticate);

router.get('/', listNotificationsHandler);
router.patch('/:notificationId/read', markAsReadHandler);

export default router;
