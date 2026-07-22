import path from 'path';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import {
  getPendingApplications,
  getApplicationHistory,
  getApplicationDetailForReview,
  getDocumentFile,
  approveApplication,
  rejectApplication,
} from './verification.service.js';

export const listPendingHandler = asyncHandler(async (req, res) => {
  const applications = await getPendingApplications();
  sendSuccess(res, { applications });
});

export const getHistoryHandler = asyncHandler(async (req, res) => {
  const history = await getApplicationHistory();
  sendSuccess(res, history);
});

// Also used, unchanged, by the Applications history popup (Change 2) -
// getApplicationDetailForReview's "mark opened" write is a guarded no-op
// there since the application is no longer PENDING by the time it's resolved.
export const getDetailHandler = asyncHandler(async (req, res) => {
  const application = await getApplicationDetailForReview(Number(req.params.applicationId), req.user.userId);
  sendSuccess(res, { application });
});

export const getDocumentHandler = asyncHandler(async (req, res) => {
  const document = await getDocumentFile(Number(req.params.documentId));
  // storage_path is saved relative to process.cwd() (see registration.service.js);
  // res.sendFile requires an absolute path or a `root` option, so resolve it here.
  res.sendFile(path.resolve(process.cwd(), document.storage_path), { headers: { 'Content-Type': document.mime_type } });
});

export const approveHandler = asyncHandler(async (req, res) => {
  const application = await approveApplication(Number(req.params.applicationId), req.user.userId);
  sendSuccess(res, { application });
});

export const rejectHandler = asyncHandler(async (req, res) => {
  const application = await rejectApplication(Number(req.params.applicationId), req.user.userId, req.body.reason);
  sendSuccess(res, { application });
});
