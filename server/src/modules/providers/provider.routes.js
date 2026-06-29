import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { uploadProfileImage } from '../../middleware/uploadFiles.js';
import { updateProviderProfileSchema, changeProviderPasswordSchema } from './provider.validation.js';
import {
  getProfileHandler,
  updateProfileHandler,
  updateProfileImageHandler,
  changePasswordHandler,
  searchProvidersHandler,
  getPublicProfileHandler,
  getPublicReviewsHandler,
  getMyReviewsHandler,
} from './provider.controller.js';

// Authenticated Service Provider self-service: mounted at /api/provider
export const providerRouter = Router();
providerRouter.use(authenticate, requireProvider);
providerRouter.get('/profile', getProfileHandler);
providerRouter.put('/profile', validateRequest(updateProviderProfileSchema), updateProfileHandler);
providerRouter.put('/profile/image', uploadProfileImage, updateProfileImageHandler);
providerRouter.put('/profile/password', validateRequest(changeProviderPasswordSchema), changePasswordHandler);
providerRouter.get('/reviews', getMyReviewsHandler);

// Public provider directory and profile: mounted at /api/providers
export const providerPublicRouter = Router();
providerPublicRouter.get('/', searchProvidersHandler);
providerPublicRouter.get('/:providerId/public', getPublicProfileHandler);
providerPublicRouter.get('/:providerId/reviews', getPublicReviewsHandler);
