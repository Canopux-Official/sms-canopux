import { getActiveStreamCount } from "../../controllers/streamController";
import { getActiveStudentCount } from "../../controllers/studentController";
import { getActiveSubjectCount } from "../../controllers/subjectController";
import { getActiveTargetExamCount } from "../../controllers/targetExamController";

import express, { Request, Response } from 'express';
import verifyAuth, { AuthRequest } from '../../middlewares/verifyAuth';
import Admin from '../../models/Admin';

const router = express.Router();

router.get('/getAdminDashboardDetails', verifyAuth, async (req: Request, res: Response): Promise<any> => {
    try {
        // Execute all count queries in parallel for better performance
        const [
            activeStudentCount,
            activeStreamCount,
            activeTargetExamCount,
            activeSubjectCount
        ] = await Promise.all([
            getActiveStudentCount(),
            getActiveStreamCount(),
            getActiveTargetExamCount(),
            getActiveSubjectCount()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                studentCount: activeStudentCount,
                streamCount: activeStreamCount,
                targetExamCount: activeTargetExamCount,
                subjectCount: activeSubjectCount
            }
        });

    } catch (error) {
        console.error("Error fetching admin dashboard details:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

router.get('/me', verifyAuth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
            res.status(403).json({ success: false, message: "Forbidden" });
            return;
        }

        const admin = await Admin.findById(req.user.id).select('-password');
        if (!admin) {
            res.status(404).json({ success: false, message: "Admin not found" });
            return;
        }

        res.status(200).json({ success: true, admin });
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export default router;