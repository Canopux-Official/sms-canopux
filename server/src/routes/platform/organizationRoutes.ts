// server/src/routes/platform/organizationRoutes.ts
import express from 'express';
import verifyPlatformAuth from '../../middlewares/verifyPlatformAuth';
import {
  getAllOrganizations,
  checkSlugAvailability,
  createOrganization,
  updateOrganizationStatus
} from '../../controllers/platform/organizationController';

const router = express.Router();

// All routes here require a valid platform-superadmin token.
// Mounted at /platform/organizations in server.ts, so the full paths are:
//   GET   /platform/organizations
//   GET   /platform/organizations/check-slug?slug=xyz
//   POST  /platform/organizations
//   PATCH /platform/organizations/:id/status
router.get('/', verifyPlatformAuth, getAllOrganizations);
router.get('/check-slug', verifyPlatformAuth, checkSlugAvailability);
router.post('/', verifyPlatformAuth, createOrganization);
router.patch('/:id/status', verifyPlatformAuth, updateOrganizationStatus);

export default router;