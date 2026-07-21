import { Router } from 'express';
import { getAdminMedicalRecords } from '../controllers/medicalRecordController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/', getAdminMedicalRecords);

export default router;
