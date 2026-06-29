import { z } from 'zod';

export const siteAssetTypeSchema = z.object({
  assetType: z.enum(['HOME_HERO_IMAGE', 'LOGIN_SIDE_IMAGE']),
});
