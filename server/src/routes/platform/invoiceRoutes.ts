// server/src/routes/platform/invoiceRoutes.ts
import express from 'express';
import verifyPlatformAuth from '../../middlewares/verifyPlatformAuth';
import {
  downloadInvoicePdf,
  getInvoice,
  deleteInvoicePayment,
  issueInvoice,
  markInvoicePaid,
  markInvoiceUnpaid,
  recordBulkPayment,
  updateInvoice,
  voidInvoice,
} from '../../controllers/platform/invoiceController';

const router = express.Router();

// Mounted at /platform/invoices in server.ts:
//   GET   /platform/invoices/:id
//   PATCH /platform/invoices/:id             edit line items / discount / tax / dates / notes
//   POST  /platform/invoices/:id/issue       draft -> issued
//   POST  /platform/invoices/:id/mark-paid   record a payment (full balance by default, or a partial amount)
//   POST  /platform/invoices/bulk-payment    settle several invoices at once (selected ledger lines)
//   POST  /platform/invoices/:id/mark-unpaid clear all recorded payments
//   DELETE /platform/invoices/:id/payments/:paymentId  undo one payment
//   POST  /platform/invoices/:id/void        any -> void
//   GET   /platform/invoices/:id/pdf         download
router.get('/:id', verifyPlatformAuth, getInvoice);
router.patch('/:id', verifyPlatformAuth, updateInvoice);
router.post('/:id/issue', verifyPlatformAuth, issueInvoice);
router.post('/:id/mark-paid', verifyPlatformAuth, markInvoicePaid);
router.post('/bulk-payment', verifyPlatformAuth, recordBulkPayment);
router.post('/:id/mark-unpaid', verifyPlatformAuth, markInvoiceUnpaid);
router.delete('/:id/payments/:paymentId', verifyPlatformAuth, deleteInvoicePayment);
router.post('/:id/void', verifyPlatformAuth, voidInvoice);
router.get('/:id/pdf', verifyPlatformAuth, downloadInvoicePdf);

export default router;