import express from 'express';
import { getAllSubjects, addSubject, updateSubject, deleteSubject, getAllActiveSubjects } from '../../controllers/subjectController';
import verifyAuth from '../../middlewares/verifyAuth';

const router = express.Router();

router.get('/all', verifyAuth, getAllSubjects); // Note: Controller returns { subjects: [...] }
router.post('/add', verifyAuth, addSubject);
router.put('/update/:id', verifyAuth, updateSubject);
router.delete('/delete/:id', verifyAuth, deleteSubject);
router.get('/getActiveSubjects', verifyAuth, getAllActiveSubjects)

export default router;