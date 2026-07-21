import { z } from 'zod';
import { PaymentStatus } from '@prisma/client';

export const createBillSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  consultationFee: z.coerce.number().min(0, 'Consultation fee must be non-negative'),
  additionalCharges: z.coerce.number().min(0, 'Additional charges must be non-negative').default(0),
  discount: z.coerce.number().min(0, 'Discount must be non-negative').default(0),
  tax: z.coerce.number().min(0, 'Tax must be non-negative').default(0),
  paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.PENDING),
  paymentMethod: z.string().trim().optional().nullable(),
});

export const updateBillSchema = z.object({
  consultationFee: z.coerce.number().min(0).optional(),
  additionalCharges: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
  tax: z.coerce.number().min(0).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  paymentMethod: z.string().trim().optional().nullable(),
});
