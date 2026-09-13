import express from 'express';
import verifyAuth from '../../middlewares/verifyAuth';
import { getStudentMarks } from '../../controllers/marksController';

const router = express.Router();

router.get('/', verifyAuth, getStudentMarks);

export default router;
