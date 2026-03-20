import express from 'express';
import noticeController from '../../controllers/noticeController';
import verifyAuth from '../../middlewares/verifyAuth';
import { requirePermission } from '../../middlewares/requirePermission';



const router = express.Router();

// Admin routes
router.post('/create', verifyAuth, requirePermission('notice'), noticeController.createNotice);
router.put('/edit/:id', verifyAuth, requirePermission('notice'), noticeController.editNotice);
router.delete('/delete/:id', verifyAuth, requirePermission('notice'), noticeController.deleteNotice);
router.get('/all', verifyAuth, requirePermission('notice'), noticeController.getAllNoticesAdmin);
router.get('/getById/:id', verifyAuth, requirePermission('notice'), noticeController.getNoticeById);

export default router