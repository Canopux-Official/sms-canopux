// server/src/routes/platform/platformAuthRoutes.ts
import express from 'express';
import { platformLogin } from '../../controllers/platform/platformAuthController';

const router = express.Router();

// POST /platform/auth/login — public, no guard (this IS the login endpoint)
router.post('/login', platformLogin);

export default router;