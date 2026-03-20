import express from 'express';
import {
    getAllStudents,
    addStudent,
    updateStudent,
    toggleStudentStatus,
    bulkAddStudents,
    deleteStudent,
    getAllActiveStudents
} from '../../controllers/studentController';
import verifyAuth from '../../middlewares/verifyAuth';
import { requirePermission } from '../../middlewares/requirePermission';

const router = express.Router();

router.get('/getAllStudents', verifyAuth, requirePermission(['students', 'session']), getAllStudents);
router.post('/add', verifyAuth, requirePermission('students'), addStudent);
router.post('/bulk-add', verifyAuth, requirePermission('students'), bulkAddStudents);
router.put('/update/:id', verifyAuth, requirePermission(['students', 'session']), updateStudent);
router.put('/toggle-status/:id', verifyAuth, requirePermission('students'), toggleStudentStatus);
router.delete('/deleteStudent/:id', verifyAuth, requirePermission('students'), deleteStudent);
router.get('/getAllActiveStudent', verifyAuth, requirePermission(['students', 'session', 'attendance', 'upload']), getAllActiveStudents);

export default router;