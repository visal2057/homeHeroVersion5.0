import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { sendMessageSchema } from './chat.validation.js';
import {
  listConversationsHandler,
  listMessagesHandler,
  sendMessageHandler,
  markReadHandler,
  unreadCountHandler,
  jobDetailsHandler,
} from './chat.controller.js';

// A Client and a Service Provider hit the exact same endpoints here - unlike
// bookings, the actions are identical for both sides, so access is
// participant-based (checked per-request in chat.service.js) rather than
// split into separate role-gated routers.
const router = Router();
router.use(authenticate);

router.get('/conversations', listConversationsHandler);
router.get('/unread-count', unreadCountHandler);
router.get('/bookings/:bookingId/messages', listMessagesHandler);
router.get('/bookings/:bookingId/job-details', jobDetailsHandler);
router.post('/bookings/:bookingId/messages', validateRequest(sendMessageSchema), sendMessageHandler);
router.patch('/bookings/:bookingId/read', markReadHandler);

export default router;
