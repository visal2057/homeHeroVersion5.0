import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as paymentSettingsService from './paymentSettings.service.js';

// GET /api/payment-settings  -> the logged-in provider's saved details (or null)
export const getPaymentSettingsHandler = asyncHandler(async (req, res) => {
  const data = await paymentSettingsService.getMyPaymentSettings(req.user.userId);
  sendSuccess(res, data);
});

// PUT /api/payment-settings  -> create or update the provider's details
export const savePaymentSettingsHandler = asyncHandler(async (req, res) => {
  const data = await paymentSettingsService.saveMyPaymentSettings(req.user.userId, req.body);
  sendSuccess(res, data);
});
