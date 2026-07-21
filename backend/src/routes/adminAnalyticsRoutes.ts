import { Router } from 'express';
import {
  getAdminDashboardAnalytics,
  getAppointmentReports,
  getRevenueReports,
  getPatientReports,
  getDoctorReports,
} from '../controllers/adminAnalyticsController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/dashboard', getAdminDashboardAnalytics);
router.get('/reports/appointments', getAppointmentReports);
router.get('/reports/revenue', getRevenueReports);
router.get('/reports/patients', getPatientReports);
router.get('/reports/doctors', getDoctorReports);

export default router;
