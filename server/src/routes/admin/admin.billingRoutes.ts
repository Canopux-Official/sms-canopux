// server/src/routes/admin/admin.billingRoutes.ts
import express from 'express';
import verifyAuth from '../../middlewares/verifyAuth';
import { downloadMyInvoicePdf, getBillingSummary, listMyInvoices } from '../../controllers/billingController';

const router = express.Router();

// Mounted at /admin/billing in server.ts. verifyAuth alone (no requirePermission) because
// the controller itself enforces superadmin-only — billing isn't in the permissions map.
router.get('/summary', verifyAuth, getBillingSummary);
router.get('/invoices', verifyAuth, listMyInvoices);
router.get('/invoices/:id/pdf', verifyAuth, downloadMyInvoicePdf);

export default router;