import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as portfolioService from './portfolio.service.js';

export const createPortfolioPostHandler = asyncHandler(async (req, res) => {
  const result = await portfolioService.createPortfolioPost(
    req.user.userId,
    {
      bookingId: req.body.bookingId ? Number(req.body.bookingId) : null,
      title: req.body.title,
      description: req.body.description,
    },
    req.files ?? [],
  );
  sendSuccess(res, result, 201);
});

export const listPortfolioPostsHandler = asyncHandler(async (req, res) => {
  const posts = await portfolioService.listMyPortfolioPosts(req.user.userId);
  sendSuccess(res, posts);
});

export const updatePortfolioPostHandler = asyncHandler(async (req, res) => {
  const post = await portfolioService.updatePortfolioPost(
    Number(req.params.postId),
    req.user.userId,
    { title: req.body.title, description: req.body.description },
    req.files ?? [],
  );
  sendSuccess(res, post);
});

export const deletePortfolioPostHandler = asyncHandler(async (req, res) => {
  await portfolioService.deletePortfolioPost(Number(req.params.postId), req.user.userId);
  sendSuccess(res, {});
});
