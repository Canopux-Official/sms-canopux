import express from 'express';
import LandingPage from '../models/LandingPage';
import connectDB from '../config/db';
import { TenantRequest } from '../middlewares/resolveTenant';
import { AuthRequest } from '../middlewares/verifyAuth';
import Organization from '../models/Organization';

// Get Landing Page Content (Public)
const getLandingPage = async (req: TenantRequest, res: express.Response): Promise<void> => {
    try {
        await connectDB();

        // Run both queries in parallel
        const [landingPage, org] = await Promise.all([
            LandingPage.findOne({ organizationId: req.organizationId }),
            Organization.findById(req.organizationId)
                .select('name slug branding')
                .lean(),
        ]);

        // Only expose public-safe fields (this route serves the public landing page)
        const organization = org
            ? {
                _id: org._id,
                name: org.name,
                slug: org.slug,
                branding: org.branding || {},
            }
            : null;

        if (!landingPage) {
            // Return empty structure matching the schema if no document exists
            res.status(200).json({
                success: true,
                data: {
                    hero: { heading: '', subheading: '', stats: [] },
                    courses: [],
                    faculty: [],
                    results: [],
                    faqs: [],
                    footer: { phones: [], email: '', address: '', socialLinks: {} },
                    gallery: []
                },
                organization
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: landingPage,
            organization
        });
    } catch (error: any) {
        console.error('Error fetching landing page:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch landing page content',
            error: error.message
        });
    }
};

// Update or Upsert Landing Page Content (Admin)
const updateLandingPage = async (req: AuthRequest, res: express.Response): Promise<void> => {
    try {
        await connectDB();
        const { hero, courses, faculty, results, faqs, footer, facultyStats, gallery } = req.body;

        const updatedLandingPage = await LandingPage.findOneAndUpdate(
            { organizationId: req.user?.organizationId },
            {
                organizationId: req.user?.organizationId,
                hero,
                courses,
                faculty,
                facultyStats,
                results,
                faqs,
                footer,
                gallery
            },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Landing page updated successfully',
            data: updatedLandingPage
        });
    } catch (error: any) {
        console.error('Error updating landing page:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to update landing page',
            error: error.message
        });
    }
};

export default {
    getLandingPage,
    updateLandingPage
};
