import { Router } from 'express';
import { getDoctorBills } from '../controllers/doctorBillController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.DOCTOR));

router.get('/', getDoctorBills);

export default router;
