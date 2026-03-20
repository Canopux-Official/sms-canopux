import express from 'express';
import { getAllExams, addExam, updateExam, deleteExam, getAllActiveExams } from '../../controllers/targetExamController';
import verifyAuth from '../../middlewares/verifyAuth';
import { requirePermission } from '../../middlewares/requirePermission';
const router = express.Router();

router.get('/all', verifyAuth, requirePermission('targetExams'), getAllExams);
router.post('/add', verifyAuth, requirePermission('targetExams'), addExam);
router.put('/update/:id', verifyAuth, requirePermission('targetExams'), updateExam);
router.delete('/delete/:id', verifyAuth, requirePermission('targetExams'), deleteExam);
router.get('/getActiveTargetExams', verifyAuth, getAllActiveExams);
export default router;