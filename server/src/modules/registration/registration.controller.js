import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import * as registrationService from './registration.service.js';

export const referenceHandler = asyncHandler(async (req, res) => {
  const reference = await registrationService.getRegistrationReference();
  sendSuccess(res, reference);
});

export const registerProviderHandler = asyncHandler(async (req, res) => {
  const result = await registrationService.registerProvider(req.body, req.files);
  sendSuccess(res, result, 201);
});
