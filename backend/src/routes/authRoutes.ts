import { Router } from 'express';
import {
  signup,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected endpoint
router.get('/me', authenticate, getMe);

export default router;
