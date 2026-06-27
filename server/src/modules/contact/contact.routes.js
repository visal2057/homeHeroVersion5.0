import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { contactMessageSchema } from './contact.validation.js';
import { submitContactMessageHandler } from './contact.controller.js';

const router = Router();

router.post('/', validateRequest(contactMessageSchema), submitContactMessageHandler);

export default router;
