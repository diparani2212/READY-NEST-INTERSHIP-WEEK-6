import { Router } from 'express';
import { uploadProfileImage, removeProfileImage } from '../controllers/profileController.js';
import { uploadMiddleware } from '../services/fileUploadService.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/upload-image', uploadMiddleware.single('image'), uploadProfileImage);
router.delete('/remove-image', removeProfileImage);

export default router;
