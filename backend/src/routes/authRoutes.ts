import { Router } from 'express';
import {
  signup,
  login,
  refresh,
  getMe,
  updatePreferences,
  updateProfile,
} from '../controllers/authController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.get('/me', requireAuth, getMe);
router.put('/preferences', requireAuth, updatePreferences);
router.put('/profile', requireAuth, updateProfile);

export default router;
