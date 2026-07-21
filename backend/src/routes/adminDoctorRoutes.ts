import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/adminDoctorController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

// Protect all routes with authentication and ADMIN role verification
router.use(authenticate, authorize(Role.ADMIN));

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', createDoctor);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);

export default router;
