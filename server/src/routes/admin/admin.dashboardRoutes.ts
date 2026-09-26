import { getActiveStreamCount } from "../../controllers/streamController";
import { getActiveStudentCount } from "../../controllers/studentController";

import { getActiveTargetExamCount } from "../../controllers/targetExamController";

import express, { Request, Response } from 'express';
import verifyAuth, { AuthRequest } from '../../middlewares/verifyAuth';
import Admin from '../../models/Admin';
import { getActiveSubjectCount } from "../../controllers/subjectController";

const router = express.Router();

router.get('/getAdminDashboardDetails', verifyAuth, async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const organizationId = req.user?.organizationId;
        const [
            activeStudentCount,
            activeStreamCount,
            activeTargetExamCount,
            activeSubjectCount
        ] = await Promise.all([
            getActiveStudentCount(organizationId as any),
            getActiveStreamCount(organizationId as any),
            getActiveTargetExamCount(organizationId as any),
            getActiveSubjectCount(organizationId as any)
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

        const admin = await Admin.findOne({ _id: req.user.id, organizationId: req.user.organizationId }).select('-password');
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