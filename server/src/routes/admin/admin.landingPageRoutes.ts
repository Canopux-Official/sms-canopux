import express from 'express';
import verifyAuth from '../../middlewares/verifyAuth';
import landingPageController from '../../controllers/landingPageController';
import { getAllStudentProfiles } from '../../controllers/studentController';

const router = express.Router();

// Update landing page content (Admin)
router.post('/update', verifyAuth, landingPageController.updateLandingPage);
router.get('/getAllStudentProfiles',verifyAuth, getAllStudentProfiles);

export default router;
