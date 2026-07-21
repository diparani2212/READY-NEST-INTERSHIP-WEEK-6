import { Router } from 'express';
import { getPatientBills, getPatientBillById } from '../controllers/patientBillController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.PATIENT));

router.get('/', getPatientBills);
router.get('/:id', getPatientBillById);

export default router;
