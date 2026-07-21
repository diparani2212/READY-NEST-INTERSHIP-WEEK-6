import { z } from 'zod';

export const createDoctorSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  phoneNumber: z.string().trim().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().trim().min(2, 'Department is required'),
  specialization: z.string().trim().min(2, 'Specialization is required'),
  qualification: z.string().trim().min(2, 'Qualification is required'),
  experience: z.coerce.number().min(0, 'Experience must be a positive number'),
  consultationFee: z.coerce.number().min(0, 'Consultation fee must be a positive number'),
  licenseNumber: z.string().trim().min(3, 'License number must be at least 3 characters'),
  availabilityStatus: z.boolean().default(true),
  profileImage: z.string().optional(),
});

export const updateDoctorSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').optional(),
  email: z.string().trim().email('Invalid email address').optional(),
  phoneNumber: z.string().trim().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  department: z.string().trim().min(2, 'Department is required').optional(),
  specialization: z.string().trim().min(2, 'Specialization is required').optional(),
  qualification: z.string().trim().min(2, 'Qualification is required').optional(),
  experience: z.coerce.number().min(0, 'Experience must be a positive number').optional(),
  consultationFee: z.coerce.number().min(0, 'Consultation fee must be a positive number').optional(),
  licenseNumber: z.string().trim().min(3, 'License number must be at least 3 characters').optional(),
  availabilityStatus: z.boolean().optional(),
  profileImage: z.string().optional(),
  isActive: z.boolean().optional(),
});
