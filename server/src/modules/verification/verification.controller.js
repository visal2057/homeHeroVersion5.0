import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import {
  getPendingApplications,
  getApplicationDetail,
  getDocumentFile,
  approveApplication,
  rejectApplication,
} from './verification.service.js';

export const listPendingHandler = asyncHandler(async (req, res) => {
  const applications = await getPendingApplications();
  sendSuccess(res, { applications });
});

export const getDetailHandler = asyncHandler(async (req, res) => {
  const application = await getApplicationDetail(Number(req.params.applicationId));
  sendSuccess(res, { application });
});

export const getDocumentHandler = asyncHandler(async (req, res) => {
  const document = await getDocumentFile(Number(req.params.documentId));
  res.sendFile(document.storage_path, { headers: { 'Content-Type': document.mime_type } });
});

export const approveHandler = asyncHandler(async (req, res) => {
  const application = await approveApplication(Number(req.params.applicationId), req.user.userId);
  sendSuccess(res, { application });
});

export const rejectHandler = asyncHandler(async (req, res) => {
  const application = await rejectApplication(Number(req.params.applicationId), req.user.userId, req.body.reason);
  sendSuccess(res, { application });
});
