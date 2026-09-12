import express from 'express';
import feeStructureController from '../../controllers/feeStructureController';
import verifyAuth from '../../middlewares/verifyAuth';
import { requirePermission } from '../../middlewares/requirePermission';

const router = express.Router();

router.get('/all', verifyAuth, requirePermission('fees'), feeStructureController.getAllFeeStructures);
router.get('/getActive', verifyAuth, requirePermission('fees'), feeStructureController.getActiveFeeStructures);
router.post('/add', verifyAuth, requirePermission('fees'), feeStructureController.addFeeStructure);
router.put('/update/:id', verifyAuth, requirePermission('fees'), feeStructureController.updateFeeStructure);
router.delete('/delete/:id', verifyAuth, requirePermission('fees'), feeStructureController.deleteFeeStructure);

export default router;