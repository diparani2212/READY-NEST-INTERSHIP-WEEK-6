import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { hashPassword } from '../utils/password.js';
import { createDoctorSchema, updateDoctorSchema } from '../utils/doctorValidation.js';
import { Role, Prisma } from '@prisma/client';
import { createNotification } from '../services/notificationService.js';
import { sendEmail, generateEmailWrapper } from '../services/emailService.js';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || '1'), 10);
    const limit = parseInt(String(req.query.limit || '10'), 10);
    const search = String(req.query.search || '').trim();
    const department = String(req.query.department || '').trim();
    const available = req.query.available ? String(req.query.available) : undefined;

    const skip = (page - 1) * limit;

    const where: Prisma.DoctorWhereInput = {};

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { department: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = { equals: department, mode: 'insensitive' };
    }

    if (available === 'true') {
      where.availabilityStatus = true;
    } else if (available === 'false') {
      where.availabilityStatus = false;
    }

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
              isActive: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.doctor.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        doctors,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: err.message,
    });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const doctor = await prisma.doctor.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profileImage: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { doctor },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor details',
      error: err.message,
    });
  }
};

export const createDoctor = async (req: Request, res: Response) => {
  try {
    const validation = createDoctorSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const data = validation.data;

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email address already exists',
      });
    }

    // Check duplicate license number
    const existingLicense = await prisma.doctor.findUnique({
      where: { licenseNumber: data.licenseNumber },
    });
    if (existingLicense) {
      return res.status(409).json({
        success: false,
        message: 'A doctor profile with this medical license number already exists',
      });
    }

    const hashedPassword = await hashPassword(data.password);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email.toLowerCase(),
          password: hashedPassword,
          role: Role.DOCTOR,
          phoneNumber: data.phoneNumber || null,
          profileImage: data.profileImage || null,
        },
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience,
          consultationFee: data.consultationFee,
          department: data.department,
          licenseNumber: data.licenseNumber,
          availabilityStatus: data.availabilityStatus,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
              isActive: true,
            },
          },
        },
      });

      return doctor;
    });

    // Trigger Notification & Email
    createNotification(
      result.user.id,
      'Doctor Account Created',
      `Welcome Dr. ${result.user.fullName}! Your medical staff account has been set up in ${result.department}.`,
      'ACCOUNT_CREATED'
    );
    sendEmail({
      to: result.user.email,
      subject: 'CityCare Hospital - Doctor Account Setup',
      html: generateEmailWrapper(
        'Staff Account Created',
        `<p>Dear <strong>Dr. ${result.user.fullName}</strong>,</p>
         <p>Your physician staff account has been created for the <strong>${result.department}</strong> department.</p>
         <p>Specialization: <strong>${result.specialization}</strong></p>
         <p>You can now log in using your email address (<strong>${result.user.email}</strong>) to manage consultation schedules and patient records.</p>`
      ),
    });

    return res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: { doctor: result },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create doctor account',
      error: err.message,
    });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor || !doctor.user) {
      return res.status(404).json({
        success: false,
        message: 'Doctor record not found',
      });
    }

    const validation = updateDoctorSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const data = validation.data;

    // Check duplicate email conflict
    if (data.email && data.email.toLowerCase() !== doctor.user.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });
      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: 'Another user account with this email address already exists',
        });
      }
    }

    // Check duplicate license conflict
    if (data.licenseNumber && data.licenseNumber !== doctor.licenseNumber) {
      const licenseConflict = await prisma.doctor.findUnique({
        where: { licenseNumber: data.licenseNumber },
      });
      if (licenseConflict) {
        return res.status(409).json({
          success: false,
          message: 'Another doctor with this medical license number already exists',
        });
      }
    }

    const userUpdateData: Prisma.UserUpdateInput = {};
    if (data.fullName !== undefined) userUpdateData.fullName = data.fullName;
    if (data.email !== undefined) userUpdateData.email = data.email.toLowerCase();
    if (data.phoneNumber !== undefined) userUpdateData.phoneNumber = data.phoneNumber || null;
    if (data.profileImage !== undefined) userUpdateData.profileImage = data.profileImage || null;
    if (data.isActive !== undefined) userUpdateData.isActive = data.isActive;
    if (data.password && data.password.trim() !== '') {
      userUpdateData.password = await hashPassword(data.password);
    }

    const doctorUpdateData: Prisma.DoctorUpdateInput = {};
    if (data.specialization !== undefined) doctorUpdateData.specialization = data.specialization;
    if (data.qualification !== undefined) doctorUpdateData.qualification = data.qualification;
    if (data.experience !== undefined) doctorUpdateData.experience = data.experience;
    if (data.consultationFee !== undefined) doctorUpdateData.consultationFee = data.consultationFee;
    if (data.department !== undefined) doctorUpdateData.department = data.department;
    if (data.licenseNumber !== undefined) doctorUpdateData.licenseNumber = data.licenseNumber;
    if (data.availabilityStatus !== undefined) doctorUpdateData.availabilityStatus = data.availabilityStatus;

    const updatedDoctor = await prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: doctor.userId },
          data: userUpdateData,
        });
      }

      return tx.doctor.update({
        where: { id: doctor.id },
        data: doctorUpdateData,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
              isActive: true,
            },
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Doctor account updated successfully',
      data: { doctor: updatedDoctor },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update doctor account',
      error: err.message,
    });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor record not found',
      });
    }

    // Delete User (which cascades to Doctor via Prisma schema onDelete: Cascade)
    await prisma.user.delete({
      where: { id: doctor.userId },
    });

    return res.status(200).json({
      success: true,
      message: 'Doctor profile and associated user account deleted successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete doctor account',
      error: err.message,
    });
  }
};
