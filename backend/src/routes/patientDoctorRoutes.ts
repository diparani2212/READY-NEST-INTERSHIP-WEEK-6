import { Router } from 'express';
import { getPublicDoctors, getPublicDoctorById } from '../controllers/patientDoctorController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getPublicDoctors);
router.get('/:id', getPublicDoctorById);

export default router;
