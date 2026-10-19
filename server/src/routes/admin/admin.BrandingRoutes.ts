


import { Router } from 'express';
import { getBranding, updateBranding } from '../../controllers/BrandingAdminController';
import verifyAuth from '../../middlewares/verifyAuth';

const router = Router();

router.get('/', verifyAuth, getBranding);
router.put('/', verifyAuth, updateBranding);


export default router;
