import { z } from 'zod';

export const updateDoctorProfileSchema = z.object({
  phoneNumber: z.string().trim().optional().nullable(),
  qualification: z.string().trim().min(2, 'Qualification is required').optional(),
  experience: z.coerce.number().min(0, 'Experience must be a positive number').optional(),
  consultationFee: z.coerce.number().min(0, 'Consultation fee must be a positive number').optional(),
  department: z.string().trim().min(2, 'Department is required').optional(),
  specialization: z.string().trim().min(2, 'Specialization is required').optional(),
  availabilityStatus: z.boolean().optional(),
  address: z.string().trim().optional().nullable(),
  bio: z.string().trim().optional().nullable(),
  consultationDuration: z.coerce.number().refine((val) => [15, 30, 45, 60].includes(val), {
    message: 'Consultation duration must be 15, 30, 45, or 60 minutes',
  }).optional(),
});
