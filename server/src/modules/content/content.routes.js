import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { requireSystemAdmin } from '../../middleware/requireSystemAdmin.js';
import { uploadSiteImage } from '../../middleware/uploadFiles.js';
import { getSiteImagesHandler, updateSiteImageHandler } from './content.controller.js';

const router = Router();

router.get('/site-images', getSiteImagesHandler);
router.put('/site-images', authenticate, requireSystemAdmin, uploadSiteImage, updateSiteImageHandler);

export default router;
