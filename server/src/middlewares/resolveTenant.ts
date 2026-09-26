import { Request, Response, NextFunction } from 'express';
import Organization from '../models/Organization';

export interface TenantRequest extends Request {
    organizationId?: string;
}

const resolveTenant = async (
    req: TenantRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const slug = req.headers['x-org-slug'] as string | undefined;

        if (!slug) {
            res.status(400).json({
                success: false,
                message: 'Access Denied: Missing X-Org-Slug header'
            });
            return;
        }

        const organization = await Organization.findOne({ slug }).select('_id status');

        if (!organization) {
            res.status(404).json({
                success: false,
                message: 'No such institute'
            });
            return;
        }

        if (organization.status === 'suspended') {
            res.status(403).json({
                success: false,
                message: 'This institute\'s access has been suspended. Contact Canopux support.'
            });
            return;
        }

        req.organizationId = String(organization._id);
        next();

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error resolving institute' });
    }
};

export default resolveTenant;