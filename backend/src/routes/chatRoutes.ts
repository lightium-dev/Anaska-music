import { Router } from 'express';
import { streamChat, getHistory } from '../controllers/chatController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);
router.post('/stream', streamChat);
router.get('/history', getHistory);

export default router;
