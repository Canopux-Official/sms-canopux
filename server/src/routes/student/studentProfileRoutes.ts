import express from 'express';
import { getStudentById } from '../../controllers/studentController';
import verifyAuth from '../../middlewares/verifyAuth'

const router= express.Router();

router.get("/getStudent", verifyAuth, getStudentById);

export default router;
