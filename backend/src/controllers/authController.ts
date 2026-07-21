import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
  verifyResetToken,
  setAuthCookies,
  clearAuthCookies,
} from '../utils/token.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validationSchemas.js';
import { Role } from '@prisma/client';
import { createNotification } from '../services/notificationService.js';
import { sendEmail, generateEmailWrapper } from '../services/emailService.js';

export const signup = async (req: Request, res: Response) => {
  const validation = signupSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { fullName, email, password, phoneNumber } = validation.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists',
    });
  }

  const hashedPassword = await hashPassword(password);

  // Strictly assign PATIENT role
  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: Role.PATIENT,
        phoneNumber: phoneNumber || null,
      },
    });

    const newPatient = await tx.patient.create({
      data: {
        userId: newUser.id,
      },
    });

    return { user: newUser, patient: newPatient };
  });

  const payload = {
    userId: result.user.id,
    email: result.user.email,
    role: result.user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  setAuthCookies(res, accessToken, refreshToken);

  // Trigger Notification & Email asynchronously
  createNotification(
    result.user.id,
    'Welcome to CityCare Hospital',
    'Your patient account has been created successfully. Welcome!',
    'ACCOUNT_CREATED'
  );
  sendEmail({
    to: result.user.email,
    subject: 'Welcome to CityCare Smart Hospital',
    html: generateEmailWrapper(
      'Account Registration',
      `<p>Dear <strong>${result.user.fullName}</strong>,</p>
       <p>Welcome to CityCare Smart Hospital. Your patient account has been created successfully.</p>
       <p>You can now log in, schedule appointments, view digital prescriptions, and download EHR charts.</p>`
    ),
  });

  return res.status(201).json({
    success: true,
    message: 'Patient registered successfully',
    data: {
      user: {
        id: result.user.id,
        fullName: result.user.fullName,
        email: result.user.email,
        role: result.user.role,
        patientId: result.patient.id,
      },
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { email, password, role } = validation.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      patient: true,
      doctor: true,
    },
  });

  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials or account disabled',
    });
  }

  // Ensure role match
  if (user.role !== role) {
    return res.status(403).json({
      success: false,
      message: `Invalid role selected for this account. Please login as ${user.role}.`,
    });
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials',
    });
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        patientId: user.patient?.id || null,
        doctorId: user.doctor?.id || null,
      },
    },
  });
};

export const logout = async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token missing',
    });
  }

  try {
    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token or user inactive',
      });
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    setAuthCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
    });
  } catch (err) {
    clearAuthCookies(res);
    return res.status(401).json({
      success: false,
      message: 'Expired or invalid refresh token',
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const validation = forgotPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { email } = validation.data;

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    // Return standard message to prevent email enumeration
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, password reset instructions have been sent.',
    });
  }

  const resetToken = generateResetToken(user.id, user.password);
  const resetUrl = `http://localhost:3000/reset-password?userId=${user.id}&token=${resetToken}`;

  return res.status(200).json({
    success: true,
    message: 'Password reset link generated successfully',
    data: {
      userId: user.id,
      resetToken,
      resetUrl,
    },
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const validation = resetPasswordSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const { userId, token, newPassword } = validation.data;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  try {
    verifyResetToken(token, user.password);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired password reset token',
    });
  }

  const newHashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: newHashedPassword },
  });

  return res.status(200).json({
    success: true,
    message: 'Password reset successfully. You can now login with your new password.',
  });
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      phoneNumber: true,
      profileImage: true,
      isActive: true,
      createdAt: true,
      patient: { select: { id: true } },
      doctor: { select: { id: true, specialization: true, department: true } },
    },
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.status(200).json({
    success: true,
    data: { user },
  });
};
