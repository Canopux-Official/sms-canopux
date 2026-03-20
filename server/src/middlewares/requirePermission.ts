import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyAuth';
import Admin from '../models/Admin';

export const requirePermission = (permissionKeys: string | string[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { user } = req;

            if (!user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }

            // Superadmins bypass permission checks
            if (user.role === 'superadmin') {
                return next();
            }

            if (user.role !== 'admin') {
                res.status(403).json({ success: false, message: 'Forbidden' });
                return;
            }

            // Fetch the most up-to-date permissions from the DB
            const adminDoc = await Admin.findById(user.id);
            if (!adminDoc) {
                res.status(404).json({ success: false, message: 'Admin record not found' });
                return;
            }

            // Normalize to array
            const keys = Array.isArray(permissionKeys) ? permissionKeys : [permissionKeys];

            // @ts-ignore - dynamic key access
            const adminPerms = adminDoc.permissions || {};
            const hasPermission = keys.some(key => adminPerms[key] === true);

            if (!hasPermission) {
                res.status(403).json({
                    success: false,
                    message: `Access Denied: You do not have permission for '${keys.join(' or ')}'`
                });
                return;
            }

            next();
        } catch (error) {
            console.error('Permission Check Error:', error);
            res.status(500).json({ success: false, message: 'Server error during permission check' });
        }
    };
};
