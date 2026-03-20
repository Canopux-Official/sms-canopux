import express from 'express';
import verifyAuth, { AuthRequest } from '../../middlewares/verifyAuth';
import Admin from '../../models/Admin';
import bcrypt from 'bcryptjs';

const router = express.Router();

/**
 * SuperAdmin Middleware
 * Ensures that the requester is explicitly a 'superadmin'
 */
const requireSuperAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction): void => {
    if (!req.user || req.user.role !== 'superadmin') {
        res.status(403).json({ success: false, message: 'Forbidden: SuperAdmin access required.' });
        return;
    }
    next();
};

/**
 * @route   GET /admin/control/getAllAdmins
 * @desc    Fetch all standard admins and their permissions
 * @access  SuperAdmin Only
 */
router.get('/getAllAdmins', verifyAuth, requireSuperAdmin, async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
        const admins = await Admin.find({ role: { $in: ['admin', 'superadmin'] } }).select('-password');
        res.status(200).json({ success: true, count: admins.length, admins });
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch admins.', error });
    }
});

/**
 * @route   PUT /admin/control/updatePermissions/:id
 * @desc    Update permissions for a specific admin
 * @access  SuperAdmin Only
 */
router.put('/updatePermissions/:id', verifyAuth, requireSuperAdmin, async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        if (!permissions) {
            res.status(400).json({ success: false, message: 'Permissions object required.' });
            return;
        }

        const updatedAdmin = await Admin.findOneAndUpdate(
            { _id: id, role: { $in: ['admin', 'superadmin'] } },
            { $set: { permissions } },
            { new: true }
        ).select('-password');

        if (!updatedAdmin) {
            res.status(404).json({ success: false, message: 'Admin not found or invalid role.' });
            return;
        }

        res.status(200).json({ success: true, message: 'Permissions updated successfully.', admin: updatedAdmin });
    } catch (error) {
        console.error("Error updating permissions:", error);
        res.status(500).json({ success: false, message: 'Failed to update permissions.', error });
    }
});

/**
 * @route   POST /admin/control/addAdmin
 * @desc    Create a new admin/superadmin user
 * @access  SuperAdmin Only
 */
router.post('/addAdmin', verifyAuth, requireSuperAdmin, async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
        const { name, phoneNumber, email, password, role, permissions } = req.body;

        if (!name || !phoneNumber || !email || !password || !role) {
            res.status(400).json({ success: false, message: 'All fields are required.' });
            return;
        }

        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { phoneNumber }]
        });

        if (existingAdmin) {
            res.status(400).json({ success: false, message: 'An admin with this email or phone number already exists.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
            name,
            phoneNumber,
            email,
            password: hashedPassword,
            role,
            permissions: permissions || undefined
        });

        await newAdmin.save();
        res.status(201).json({ success: true, message: 'Admin created successfully.', admin: newAdmin });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ success: false, message: 'Failed to create admin.', error });
    }
});

/**
 * @route   PUT /admin/control/updateAdmin/:id
 * @desc    Update admin details
 * @access  SuperAdmin Only
 */
router.put('/updateAdmin/:id', verifyAuth, requireSuperAdmin, async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, phoneNumber, email, role, password } = req.body;

        const admin = await Admin.findById(id);
        if (!admin) {
            res.status(404).json({ success: false, message: 'Admin not found.' });
            return;
        }

        const existingAdmin = await Admin.findOne({
            _id: { $ne: id },
            $or: [{ email }, { phoneNumber }]
        });

        if (existingAdmin) {
            res.status(400).json({ success: false, message: 'An admin with this email or phone number already exists.' });
            return;
        }

        if (name) admin.name = name;
        if (phoneNumber) admin.phoneNumber = phoneNumber;
        if (email) admin.email = email;
        if (role) admin.role = role;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }

        if (admin.role === 'superadmin') {
            admin.permissions = {
                students: true, streams: true, targetExams: true,
                subjects: true, session: true, upload: true,
                notice: true, attendance: true
            };
        }

        await admin.save();
        res.status(200).json({ success: true, message: 'Admin updated successfully.', admin });
    } catch (error) {
        console.error("Error updating admin:", error);
        res.status(500).json({ success: false, message: 'Failed to update admin.', error });
    }
});

/**
 * @route   DELETE /admin/control/deleteAdmin/:id
 * @desc    Delete an admin user
 * @access  SuperAdmin Only
 */
router.delete('/deleteAdmin/:id', verifyAuth, requireSuperAdmin, async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (id === req.user?.id) {
            res.status(400).json({ success: false, message: 'You cannot delete yourself.' });
            return;
        }

        const deletedAdmin = await Admin.findByIdAndDelete(id);

        if (!deletedAdmin) {
            res.status(404).json({ success: false, message: 'Admin not found.' });
            return;
        }

        res.status(200).json({ success: true, message: 'Admin deleted successfully.' });
    } catch (error) {
        console.error("Error deleting admin:", error);
        res.status(500).json({ success: false, message: 'Failed to delete admin.', error });
    }
});

export default router;
