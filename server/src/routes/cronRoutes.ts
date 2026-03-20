import { Router, Request, Response } from 'express';
import materialController from '../controllers/materialcontroller';

const router = Router();

router.get('/cleanup', async (req: Request, res: Response) => {
  // 1. Get the Authorization header Vercel sends
  const authHeader = req.headers.authorization;

  // 2. Check if it matches your CRON_SECRET (explained in Step 3)
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting scheduled cleanup...');
    await materialController.cleanupInactiveMaterials();
    res.status(200).json({ success: true, message: 'Cleanup successful' });
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;