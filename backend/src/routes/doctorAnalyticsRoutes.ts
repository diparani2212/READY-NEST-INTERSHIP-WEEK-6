import { Router } from 'express';
import { getDoctorDashboardAnalytics } from '../controllers/doctorAnalyticsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.DOCTOR));

router.get('/analytics', getDoctorDashboardAnalytics);

export default router;
