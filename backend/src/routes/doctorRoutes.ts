import { Router } from 'express';
import {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorDashboard,
  getDoctorAppointments,
  getDoctorAppointmentById,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
  getDoctorPatientDetails,
} from '../controllers/doctorController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

// Doctor role authorization guard for all routes
router.use(authenticate, authorize(Role.DOCTOR));

router.get('/profile', getDoctorProfile);
router.put('/profile', updateDoctorProfile);
router.get('/dashboard', getDoctorDashboard);
router.get('/appointments', getDoctorAppointments);
router.get('/appointments/:id', getDoctorAppointmentById);
router.put('/appointments/:id/confirm', confirmAppointment);
router.put('/appointments/:id/reject', rejectAppointment);
router.put('/appointments/:id/complete', completeAppointment);
router.get('/patients/:id', getDoctorPatientDetails);

export default router;
