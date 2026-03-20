import express from 'express';
import materialController from '../../controllers/materialcontroller';
import verifyAuth from '../../middlewares/verifyAuth';
import { requirePermission } from '../../middlewares/requirePermission';



const router = express.Router();


router.post('/create-class', verifyAuth, requirePermission('upload'), materialController.createClassId);
router.post('/create-sub-folder/:id', verifyAuth, requirePermission('upload'), materialController.createSubFolder);
router.get('/get-folders/:id', verifyAuth, requirePermission('upload'), materialController.findByParentId);
router.delete('/delete-sub-folder/:id', verifyAuth, requirePermission('upload'), materialController.deleteSubFolder);
router.patch('/update-sub-folder/:id', verifyAuth, requirePermission('upload'), materialController.updateSubFolder);
router.get('/get-all-classes', verifyAuth, requirePermission('upload'), materialController.getAllClasses);
router.post('/confirm-folder-deletion', verifyAuth, requirePermission('upload'), materialController.confirmFolderDeletion);
router.get('/files', verifyAuth, requirePermission('upload'), materialController.getAllFiles);
router.post('/cleanup', verifyAuth, requirePermission('upload'), materialController.triggerCleanup);


export default router;