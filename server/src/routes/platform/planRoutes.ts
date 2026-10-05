// server/src/routes/platform/planRoutes.ts
import express from 'express';
import verifyPlatformAuth from '../../middlewares/verifyPlatformAuth';
import { createPlan, deletePlan, listPlans, updatePlan } from '../../controllers/platform/planController';

const router = express.Router();

// Mounted at /platform/plans in server.ts:
//   GET   /platform/plans                 all plans (every plan is always selectable)
//   POST  /platform/plans                 create a new plan template
//   PATCH /platform/plans/:id             edit a plan template (future assignments only)
//   DELETE /platform/plans/:id            only when no institute is currently on the plan
router.get('/', verifyPlatformAuth, listPlans);
router.post('/', verifyPlatformAuth, createPlan);
router.patch('/:id', verifyPlatformAuth, updatePlan);
router.delete('/:id', verifyPlatformAuth, deletePlan);

export default router;