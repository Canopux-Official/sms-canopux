import express from 'express';
import noticeController from '../../controllers/noticeController';
import verifyAuth from '../../middlewares/verifyAuth';



const router = express.Router();

// Student routes
router.get('/', verifyAuth, noticeController.getNoticesForStudent);
router.get('/notices/:id', verifyAuth, noticeController.getNoticeById);


export default router