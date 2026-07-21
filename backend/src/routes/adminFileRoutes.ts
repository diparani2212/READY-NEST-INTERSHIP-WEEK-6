import { Router } from 'express';
import { getAdminFiles, deleteAdminFile } from '../controllers/fileUploadController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.get('/', getAdminFiles);
router.delete('/:id', deleteAdminFile);

export default router;
