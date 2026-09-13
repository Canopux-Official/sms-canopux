import express from 'express';
import verifyAuth from '../../middlewares/verifyAuth';
import { requirePermission } from '../../middlewares/requirePermission';
import {
  createTest,
  getAllTests,
  getTestById,
  updateTest,
  deleteTest,
  getEligibleStudents,
  assignStudents,
  getMarksEntry,
  saveMarksEntry,
  publishTest,
  unpublishTest
} from '../../controllers/marksController';

const router = express.Router();

// Test CRUD
router.post('/create-test', verifyAuth, requirePermission('marks'), createTest);
router.get('/all-tests', verifyAuth, requirePermission('marks'), getAllTests);
router.get('/test/:id', verifyAuth, requirePermission('marks'), getTestById);
router.put('/update-test/:id', verifyAuth, requirePermission('marks'), updateTest);
router.delete('/delete-test/:id', verifyAuth, requirePermission('marks'), deleteTest);

// Assignment
router.get('/eligible-students/:id', verifyAuth, requirePermission('marks'), getEligibleStudents);
router.post('/assign/:id', verifyAuth, requirePermission('marks'), assignStudents);

// Marks entry (spreadsheet-style)
router.get('/entry/:id', verifyAuth, requirePermission('marks'), getMarksEntry);
router.patch('/entry/:id', verifyAuth, requirePermission('marks'), saveMarksEntry);

// Publish / unpublish
router.post('/publish/:id', verifyAuth, requirePermission('marks'), publishTest);
router.post('/unpublish/:id', verifyAuth, requirePermission('marks'), unpublishTest);

export default router;
