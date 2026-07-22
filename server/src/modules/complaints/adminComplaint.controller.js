import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { getAllComplaints, getComplaintHistory, getComplaintDetail, recordVerdict } from './complaint.service.js';

export const listComplaintsHandler = asyncHandler(async (req, res) => {
  const complaints = await getAllComplaints();
  sendSuccess(res, { complaints });
});

export const getComplaintHistoryHandler = asyncHandler(async (req, res) => {
  const complaints = await getComplaintHistory();
  sendSuccess(res, { complaints });
});

export const getComplaintDetailHandler = asyncHandler(async (req, res) => {
  const complaint = await getComplaintDetail(Number(req.params.complaintId), req.user.userId);
  sendSuccess(res, { complaint });
});

export const submitVerdictHandler = asyncHandler(async (req, res) => {
  const complaint = await recordVerdict(Number(req.params.complaintId), req.body, req.user.userId);
  sendSuccess(res, { complaint });
});
