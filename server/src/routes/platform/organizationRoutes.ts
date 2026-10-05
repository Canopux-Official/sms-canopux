// server/src/routes/platform/organizationRoutes.ts
import express from 'express';
import verifyPlatformAuth from '../../middlewares/verifyPlatformAuth';
import {
  getAllOrganizations,
  checkSlugAvailability,
  createOrganization,
  updateOrganizationStatus,
  getOrganizationDetail,
  deleteOrganization,
  impersonateOrganizationAdmin,
} from '../../controllers/platform/organizationController';
import { assignPlan } from '../../controllers/platform/subscriptionController';
import { createManualInvoice, listInvoicesForOrganization } from '../../controllers/platform/invoiceController';

const router = express.Router();

// All routes here require a valid platform-superadmin token.
// Mounted at /platform/organizations in server.ts:
//   GET   /platform/organizations
//   GET   /platform/organizations/check-slug?slug=xyz
//   POST  /platform/organizations
//   GET   /platform/organizations/:id                    full detail (plan, billing history, monthly summary)
//   PATCH /platform/organizations/:id/status              suspend / reactivate
//   POST  /platform/organizations/:id/subscription        assign/renew a plan (creates a draft invoice)
//   GET   /platform/organizations/:id/invoices            invoice list for this org
//   POST  /platform/organizations/:id/invoices            ad-hoc invoice, not tied to a plan purchase
//   DELETE /platform/organizations/:id                    permanently delete a SUSPENDED institute and all its data (body: { confirmSlug })
//   POST  /platform/organizations/:id/login-as             issue an institute superadmin token (impersonation)
router.get('/', verifyPlatformAuth, getAllOrganizations);
router.get('/check-slug', verifyPlatformAuth, checkSlugAvailability);
router.post('/', verifyPlatformAuth, createOrganization);
router.get('/:id', verifyPlatformAuth, getOrganizationDetail);
router.patch('/:id/status', verifyPlatformAuth, updateOrganizationStatus);
router.post('/:id/subscription', verifyPlatformAuth, assignPlan);
router.get('/:id/invoices', verifyPlatformAuth, listInvoicesForOrganization);
router.post('/:id/invoices', verifyPlatformAuth, createManualInvoice);
router.delete('/:id', verifyPlatformAuth, deleteOrganization);
router.post('/:id/login-as', verifyPlatformAuth, impersonateOrganizationAdmin);

export default router;