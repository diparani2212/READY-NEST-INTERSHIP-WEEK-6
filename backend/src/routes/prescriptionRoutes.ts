import { Router } from 'express';
import {
  createPrescription,
  getPrescriptionById,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  updatePrescription,
} from '../controllers/prescriptionController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createPrescription);
router.get('/patient', getPatientPrescriptions);
router.get('/doctor', getDoctorPrescriptions);
router.get('/:id', getPrescriptionById);
router.put('/:id', updatePrescription);

export default router;
