import { Router } from 'express';
import {
  createBill,
  getAdminBills,
  getAdminBillById,
  updateBill,
  deleteBill,
} from '../controllers/adminBillController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorize(Role.ADMIN));

router.post('/', createBill);
router.get('/', getAdminBills);
router.get('/:id', getAdminBillById);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);

export default router;
