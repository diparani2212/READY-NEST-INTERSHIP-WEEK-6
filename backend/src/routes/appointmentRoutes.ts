import { Router } from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.PATIENT));

router.post('/', createAppointment);
router.get('/my', getMyAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id/cancel', cancelAppointment);

export default router;
