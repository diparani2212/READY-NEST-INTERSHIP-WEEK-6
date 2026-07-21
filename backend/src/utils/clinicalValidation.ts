import { z } from 'zod';

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  diagnosis: z.string().trim().min(2, 'Diagnosis must be at least 2 characters'),
  medicines: z.string().min(2, 'Medicines configuration is required'),
  dosage: z.string().trim().min(1, 'Dosage instructions are required'),
  instructions: z.string().trim().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
});

export const updatePrescriptionSchema = z.object({
  diagnosis: z.string().trim().min(2, 'Diagnosis must be at least 2 characters').optional(),
  medicines: z.string().min(2, 'Medicines configuration is required').optional(),
  dosage: z.string().trim().min(1, 'Dosage instructions are required').optional(),
  instructions: z.string().trim().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
});

export const createMedicalRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().optional().nullable(),
  chiefComplaint: z.string().trim().min(2, 'Chief complaint must be at least 2 characters'),
  diagnosis: z.string().trim().min(2, 'Diagnosis must be at least 2 characters'),
  allergies: z.string().trim().optional().nullable(),
  treatment: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  bloodPressure: z.string().trim().optional().nullable(),
  pulseRate: z.string().trim().optional().nullable(),
  bodyTemperature: z.string().trim().optional().nullable(),
  height: z.coerce.number().min(0).optional().nullable(),
  weight: z.coerce.number().min(0).optional().nullable(),
  reportFile: z.string().trim().optional().nullable(),
});

export const updateMedicalRecordSchema = z.object({
  chiefComplaint: z.string().trim().min(2, 'Chief complaint must be at least 2 characters').optional(),
  diagnosis: z.string().trim().min(2, 'Diagnosis must be at least 2 characters').optional(),
  allergies: z.string().trim().optional().nullable(),
  treatment: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  bloodPressure: z.string().trim().optional().nullable(),
  pulseRate: z.string().trim().optional().nullable(),
  bodyTemperature: z.string().trim().optional().nullable(),
  height: z.coerce.number().min(0).optional().nullable(),
  weight: z.coerce.number().min(0).optional().nullable(),
  reportFile: z.string().trim().optional().nullable(),
});
