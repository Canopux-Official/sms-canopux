import express from 'express';
import feeController from '../../controllers/feeController';
import verifyAuth from '../../middlewares/verifyAuth';
import { requirePermission } from '../../middlewares/requirePermission';

const router = express.Router();

router.post('/assign', verifyAuth, requirePermission('fees'), feeController.assignFee);
router.get('/student/:studentId', verifyAuth, requirePermission('fees'), feeController.getStudentFeeByAdmin);
router.get('/payments/:studentId', verifyAuth, requirePermission('fees'), feeController.getPaymentsByStudent);
router.post('/pay', verifyAuth, requirePermission('fees'), feeController.recordPayment);
router.get('/dues', verifyAuth, requirePermission('fees'), feeController.getDues);
router.get('/reports', verifyAuth, requirePermission('fees'), feeController.getFeeReports);

export default router;