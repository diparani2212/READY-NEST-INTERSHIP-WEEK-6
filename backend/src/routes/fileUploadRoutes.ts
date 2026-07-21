import { Router } from 'express';
import {
  uploadMedicalReportFile,
  getMedicalReportFileById,
  deleteMedicalReportFile,
} from '../controllers/fileUploadController.js';
import { uploadMiddleware } from '../services/fileUploadService.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadMiddleware.single('file'), uploadMedicalReportFile);
router.get('/files/:id', getMedicalReportFileById);
router.delete('/files/:id', deleteMedicalReportFile);

export default router;
