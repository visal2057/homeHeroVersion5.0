import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { uploadVerificationDocuments } from '../../middleware/uploadFiles.js';
import { providerRegistrationSchema } from './registration.validation.js';
import { referenceHandler, registerProviderHandler } from './registration.controller.js';

const router = Router();

router.get('/reference', referenceHandler);
router.post(
  '/provider',
  uploadVerificationDocuments,
  validateRequest(providerRegistrationSchema),
  registerProviderHandler,
);

export default router;
