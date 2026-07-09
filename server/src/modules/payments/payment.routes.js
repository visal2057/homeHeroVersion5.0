import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireClient } from '../../middleware/requireClient.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { cashPaymentSchema, cardPaymentSchema } from './payment.validation.js';
import {
  getPaymentContextHandler,
  payCashHandler,
  payCardHandler,
  getProviderTotalEarningsHandler,
  getCardPaymentAmountHandler,
} from './payment.controller.js';

const router = Router();
router.use(authenticate);

// Client payment actions.
router.get('/booking/:bookingId', requireClient, getPaymentContextHandler);
router.post('/cash', requireClient, validateRequest(cashPaymentSchema), payCashHandler);
router.post('/card', requireClient, validateRequest(cardPaymentSchema), payCardHandler);

// Provider-facing reads: Total Earnings via HomeHero, and the locked
// Card-payment amount Dinuka's invoice module autofills from.
router.get('/provider/earnings/total', requireProvider, getProviderTotalEarningsHandler);
router.get('/booking/:bookingId/card-amount', requireProvider, getCardPaymentAmountHandler);

export default router;
