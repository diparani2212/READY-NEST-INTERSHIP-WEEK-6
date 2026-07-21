import { Router } from 'express';
import { getPatientDashboardAnalytics } from '../controllers/patientAnalyticsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.PATIENT));

router.get('/analytics', getPatientDashboardAnalytics);

export default router;
