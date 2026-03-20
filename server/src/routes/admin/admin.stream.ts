import express from 'express';
import { getAllStreams, addStream, updateStream, deleteStream, getAllActiveStreams } from '../../controllers/streamController';
import verifyAuth from '../../middlewares/verifyAuth';
import { requirePermission } from '../../middlewares/requirePermission';
const router = express.Router();

router.get('/all', verifyAuth, requirePermission('streams'), getAllStreams);
router.post('/add', verifyAuth, requirePermission('streams'), addStream);
router.put('/update/:id', verifyAuth, requirePermission('streams'), updateStream);
router.delete('/delete/:id', verifyAuth, requirePermission('streams'), deleteStream);
router.get('/getActiveStreams', verifyAuth, getAllActiveStreams);

export default router;