// server/src/routes/platform/planRoutes.ts
import express from 'express';
import verifyPlatformAuth from '../../middlewares/verifyPlatformAuth';
import { getAllPlans } from '../../controllers/platform/organizationController';

const router = express.Router();

// Mounted at /platform/plans in server.ts -> GET /platform/plans
router.get('/', verifyPlatformAuth, getAllPlans);

export default router;