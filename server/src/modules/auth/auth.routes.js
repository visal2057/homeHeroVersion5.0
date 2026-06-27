import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { authenticate } from '../../middleware/authenticate.js';
import {
  clientRegistrationSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation.js';
import {
  registerClientHandler,
  loginHandler,
  meHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from './auth.controller.js';

const router = Router();

router.post('/register/client', validateRequest(clientRegistrationSchema), registerClientHandler);
router.post('/login', validateRequest(loginSchema), loginHandler);
router.get('/me', authenticate, meHandler);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPasswordHandler);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPasswordHandler);

export default router;
