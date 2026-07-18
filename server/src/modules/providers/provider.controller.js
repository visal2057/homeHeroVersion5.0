import path from 'path';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { AppError } from '../../utils/AppError.js';
import * as providerService from './provider.service.js';
import * as providerSearchService from './providerSearch.service.js';

export const getProfileHandler = asyncHandler(async (req, res) => {
  const profile = await providerService.getProviderProfile(req.user.userId);
  sendSuccess(res, profile);
});

export const updateProfileHandler = asyncHandler(async (req, res) => {
  const profile = await providerService.updateProviderProfile(req.user.userId, req.body);
  sendSuccess(res, profile);
});

export const updateProfileImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('A profile image file is required', 422);
  }
  const profileImageUrl = `/public/profile-images/${path.basename(req.file.path)}`;
  const result = await providerService.updateProviderProfileImagePath(req.user.userId, profileImageUrl);
  sendSuccess(res, result);
});

export const changePasswordHandler = asyncHandler(async (req, res) => {
  await providerService.changeProviderPassword(req.user.userId, req.body);
  sendSuccess(res, { message: 'Password updated successfully' });
});

export const searchProvidersHandler = asyncHandler(async (req, res) => {
  if (!req.query.category) {
    throw new AppError('A service category is required', 422);
  }
  const result = await providerSearchService.searchProviders({
    categorySlug: req.query.category,
    district: req.query.district || null,
    search: req.query.search || null,
  });
  sendSuccess(res, result);
});

export const getPublicProfileHandler = asyncHandler(async (req, res) => {
  const profile = await providerSearchService.getPublicProviderProfile(req.params.providerId, req.query.category);
  sendSuccess(res, profile);
});

export const getPublicReviewsHandler = asyncHandler(async (req, res) => {
  const reviews = await providerSearchService.getPublicProviderReviews(req.params.providerId);
  sendSuccess(res, reviews);
});

// The provider dashboard's review list was already built against snake_case field
// names, while the public client-facing profile uses camelCase, so this adapts
// the same underlying data to that existing contract instead of duplicating queries.
export const getMyReviewsHandler = asyncHandler(async (req, res) => {
  const reviews = await providerSearchService.getPublicProviderReviews(req.user.userId);
  sendSuccess(
    res,
    reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.createdAt,
      client_name: r.clientName,
      booking_id: r.bookingId,
      service_category: r.serviceCategory,
    })),
  );
});
