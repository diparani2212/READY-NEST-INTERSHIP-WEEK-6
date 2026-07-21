import { z } from 'zod';
import { Role } from '@prisma/client';

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
    phoneNumber: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Role must be PATIENT, DOCTOR, or ADMIN' }),
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    userId: z.string().min(1, 'User ID is required'),
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
