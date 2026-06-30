import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireClient } from '../../middleware/requireClient.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { cashPaymentSchema, cardPaymentSchema } from './payment.validation.js';
import {
  getPaymentContextHandler,
  payCashHandler,
  payCardHandler,
} from './payment.controller.js';

// All payment actions are done by a logged-in client, so every route here
// runs through authenticate + requireClient first.
const router = Router();
router.use(authenticate, requireClient);

router.get('/booking/:bookingId', getPaymentContextHandler);
router.post('/cash', validateRequest(cashPaymentSchema), payCashHandler);
router.post('/card', validateRequest(cardPaymentSchema), payCardHandler);

export default router;
