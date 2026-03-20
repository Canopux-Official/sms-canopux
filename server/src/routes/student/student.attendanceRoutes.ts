import express from 'express';
import verifyAuth from '../../middlewares/verifyAuth';
import { getAttendanceStats, getAvailableYears, getYearlyAttendance } from '../../controllers/studentAttendanceController';


const router = express.Router();
router.get('/yearly', verifyAuth, getYearlyAttendance);
router.get('/stats', verifyAuth, getAttendanceStats);
router.get('/years', verifyAuth, getAvailableYears);

export default router;
