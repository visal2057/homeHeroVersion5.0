import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireProvider } from '../../middleware/requireProvider.js';
import { checkProviderVerification } from '../../middleware/checkProviderVerification.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { uploadProfileImage, uploadPortfolioImages } from '../../middleware/uploadFiles.js';
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
import {
  submitProviderComplaintHandler,
  listProviderComplaintsHandler,
} from '../complaints/providerComplaint.controller.js';
import {
  createPortfolioPostHandler,
  listPortfolioPostsHandler,
  updatePortfolioPostHandler,
  deletePortfolioPostHandler,
} from '../portfolio/portfolio.controller.js';

// Authenticated Service Provider self-service: mounted at /api/provider
export const providerRouter = Router();
providerRouter.use(authenticate, requireProvider, checkProviderVerification);
providerRouter.get('/profile', getProfileHandler);
providerRouter.put('/profile', validateRequest(updateProviderProfileSchema), updateProfileHandler);
providerRouter.put('/profile/image', uploadProfileImage, updateProfileImageHandler);
providerRouter.put('/profile/password', validateRequest(changeProviderPasswordSchema), changePasswordHandler);
providerRouter.get('/reviews', getMyReviewsHandler);

providerRouter.get('/complaints', listProviderComplaintsHandler);
providerRouter.post('/complaints', submitProviderComplaintHandler);

providerRouter.get('/portfolio', listPortfolioPostsHandler);
providerRouter.post('/portfolio', uploadPortfolioImages, createPortfolioPostHandler);
providerRouter.put('/portfolio/:postId', updatePortfolioPostHandler);
providerRouter.delete('/portfolio/:postId', deletePortfolioPostHandler);

// Public provider directory and profile: mounted at /api/providers
export const providerPublicRouter = Router();
providerPublicRouter.get('/', searchProvidersHandler);
providerPublicRouter.get('/:providerId/public', getPublicProfileHandler);
providerPublicRouter.get('/:providerId/reviews', getPublicReviewsHandler);
