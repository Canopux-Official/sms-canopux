import express from 'express';
import feeController from '../../controllers/feeController';
import verifyAuth from '../../middlewares/verifyAuth';

const router = express.Router();

router.get('/my', verifyAuth, feeController.getMyFee);
router.get('/my/payments', verifyAuth, feeController.getMyPayments);

export default router;