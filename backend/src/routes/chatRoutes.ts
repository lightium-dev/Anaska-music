import { Router } from 'express';
import { streamChat, getHistory } from '../controllers/chatController';
import { optionalAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(optionalAuth);
router.post('/stream', streamChat);
router.get('/history', getHistory);

export default router;
