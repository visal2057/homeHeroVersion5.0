import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/responseUtils.js';
import { getSiteImages, updateSiteImage } from './content.service.js';

export const getSiteImagesHandler = asyncHandler(async (req, res) => {
  const images = await getSiteImages();
  sendSuccess(res, { images });
});

export const updateSiteImageHandler = asyncHandler(async (req, res) => {
  const image = await updateSiteImage(
    { assetType: req.body.assetType, file: req.file, altText: req.body.altText },
    req.user.userId,
  );
  sendSuccess(res, { image });
});
