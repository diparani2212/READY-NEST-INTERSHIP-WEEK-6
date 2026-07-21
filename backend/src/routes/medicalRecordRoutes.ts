import { Router } from 'express';
import {
  createMedicalRecord,
  getMedicalRecordById,
  getPatientMedicalRecords,
  getDoctorMedicalRecords,
  updateMedicalRecord,
} from '../controllers/medicalRecordController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createMedicalRecord);
router.get('/patient', getPatientMedicalRecords);
router.get('/doctor', getDoctorMedicalRecords);
router.get('/:id', getMedicalRecordById);
router.put('/:id', updateMedicalRecord);

export default router;
