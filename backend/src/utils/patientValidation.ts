import { z } from 'zod';
import { Gender } from '@prisma/client';

export const updatePatientProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').optional(),
  phoneNumber: z.string().trim().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  bloodGroup: z.string().trim().optional().nullable(),
  height: z.coerce.number().min(0, 'Height must be a positive number').optional().nullable(),
  weight: z.coerce.number().min(0, 'Weight must be a positive number').optional().nullable(),
  address: z.string().trim().optional().nullable(),
  emergencyContact: z.string().trim().optional().nullable(),
});

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  appointmentTime: z.string().min(1, 'Appointment time is required'),
  reason: z.string().trim().optional(),
});
