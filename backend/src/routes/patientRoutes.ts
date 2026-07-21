import { Router } from 'express';
import { getPatientProfile, updatePatientProfile } from '../controllers/patientController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.PATIENT));

router.get('/profile', getPatientProfile);
router.put('/profile', updatePatientProfile);

export default router;
