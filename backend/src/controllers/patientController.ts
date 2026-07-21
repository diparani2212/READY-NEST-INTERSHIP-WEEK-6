import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { updatePatientProfileSchema } from '../utils/patientValidation.js';
import { Prisma } from '@prisma/client';

export const getPatientProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profileImage: true,
        role: true,
        createdAt: true,
        patient: true,
      },
    });

    if (!user || !user.patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          id: user.id,
          patientId: user.patient.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
          dateOfBirth: user.patient.dateOfBirth,
          gender: user.patient.gender,
          bloodGroup: user.patient.bloodGroup,
          height: user.patient.height,
          weight: user.patient.weight,
          address: user.patient.address,
          emergencyContact: user.patient.emergencyContact,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch patient profile',
      error: err.message,
    });
  }
};

export const updatePatientProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const validation = updatePatientProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const data = validation.data;

    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile record not found' });
    }

    const userUpdate: Prisma.UserUpdateInput = {};
    if (data.fullName !== undefined) userUpdate.fullName = data.fullName;
    if (data.phoneNumber !== undefined) userUpdate.phoneNumber = data.phoneNumber || null;

    const patientUpdate: Prisma.PatientUpdateInput = {};
    if (data.dateOfBirth !== undefined) {
      patientUpdate.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }
    if (data.gender !== undefined) patientUpdate.gender = data.gender;
    if (data.bloodGroup !== undefined) patientUpdate.bloodGroup = data.bloodGroup || null;
    if (data.height !== undefined) patientUpdate.height = data.height;
    if (data.weight !== undefined) patientUpdate.weight = data.weight;
    if (data.address !== undefined) patientUpdate.address = data.address || null;
    if (data.emergencyContact !== undefined) patientUpdate.emergencyContact = data.emergencyContact || null;

    const updatedProfile = await prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: req.user!.userId },
          data: userUpdate,
        });
      }

      const updatedPatient = await tx.patient.update({
        where: { id: patient.id },
        data: patientUpdate,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profileImage: true,
            },
          },
        },
      });

      return updatedPatient;
    });

    return res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      data: {
        profile: {
          id: updatedProfile.user.id,
          patientId: updatedProfile.id,
          fullName: updatedProfile.user.fullName,
          email: updatedProfile.user.email,
          phoneNumber: updatedProfile.user.phoneNumber,
          profileImage: updatedProfile.user.profileImage,
          dateOfBirth: updatedProfile.dateOfBirth,
          gender: updatedProfile.gender,
          bloodGroup: updatedProfile.bloodGroup,
          height: updatedProfile.height,
          weight: updatedProfile.weight,
          address: updatedProfile.address,
          emergencyContact: updatedProfile.emergencyContact,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update patient profile',
      error: err.message,
    });
  }
};
