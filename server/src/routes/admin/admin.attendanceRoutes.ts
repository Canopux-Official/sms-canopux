import express from 'express';
import { bulkSyncAttendance, getAdminAttendanceView } from '../../controllers/attendanceController';
import verifyAuth from '../../middlewares/verifyAuth';
import { requirePermission } from '../../middlewares/requirePermission';



const router = express.Router();

router.get("/view", verifyAuth, requirePermission('attendance'), getAdminAttendanceView);
router.post("/sync", verifyAuth, requirePermission('attendance'), bulkSyncAttendance);

export default router;