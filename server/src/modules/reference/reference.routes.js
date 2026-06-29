import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { listDistricts, listServiceCategories } from '../registration/registration.queries.js';

const router = Router();

router.get(
  '/districts',
  asyncHandler(async (req, res) => {
    const { rows } = await listDistricts();
    sendSuccess(res, rows);
  }),
);

router.get(
  '/service-categories',
  asyncHandler(async (req, res) => {
    const { rows } = await listServiceCategories();
    sendSuccess(res, rows);
  }),
);

export default router;
