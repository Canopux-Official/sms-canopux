import express from 'express';
import LandingPage from '../models/LandingPage';
import connectDB from '../config/db';

// Get Landing Page Content (Public)
const getLandingPage = async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        await connectDB();
        const landingPage = await LandingPage.findOne();

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
                }
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: landingPage
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
const updateLandingPage = async (req: express.Request, res: express.Response): Promise<void> => {
    try {
        await connectDB();
        const { hero, courses, faculty, results, faqs, footer, facultyStats, gallery  } = req.body;

        const updatedLandingPage = await LandingPage.findOneAndUpdate(
            {},
            {
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
