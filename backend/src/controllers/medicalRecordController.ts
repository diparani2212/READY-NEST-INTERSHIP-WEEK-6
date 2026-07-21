import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { createMedicalRecordSchema, updateMedicalRecordSchema } from '../utils/clinicalValidation.js';
import { Role, Prisma } from '@prisma/client';

export const createMedicalRecord = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const validation = createMedicalRecordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const {
      patientId,
      appointmentId,
      chiefComplaint,
      diagnosis,
      allergies,
      treatment,
      notes,
      bloodPressure,
      pulseRate,
      bodyTemperature,
      height,
      weight,
      reportFile,
    } = validation.data;

    // Fetch Doctor profile
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only registered doctors can create medical records' });
    }

    // Verify appointment details if provided
    if (appointmentId) {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });
      if (!appointment || appointment.doctorId !== doctor.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only attach medical records to appointments assigned to you',
        });
      }
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId: doctor.id,
        appointmentId: appointmentId || null,
        chiefComplaint,
        diagnosis,
        allergies: allergies || null,
        treatment: treatment || null,
        notes: notes || null,
        bloodPressure: bloodPressure || null,
        pulseRate: pulseRate || null,
        bodyTemperature: bodyTemperature || null,
        height: height || null,
        weight: weight || null,
        reportFile: reportFile || null,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Medical record charted successfully',
      data: { record },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create medical record',
      error: err.message,
    });
  }
};

export const getMedicalRecordById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const record = await prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
        },
        appointment: true,
      },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    // Role-based validation
    if (req.user.role === Role.PATIENT) {
      // Verify ownership
      if (record.patient.userId !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Access denied to this medical record' });
      }
    } else if (req.user.role === Role.DOCTOR) {
      // Verify doctor assignment
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.userId } });
      if (!doctor || record.doctorId !== doctor.id) {
        return res.status(403).json({ success: false, message: 'Access denied to this medical record' });
      }
    }

    return res.status(200).json({
      success: true,
      data: { record },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch medical record',
      error: err.message,
    });
  }
};

export const getPatientMedicalRecords = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const records = await prisma.medicalRecord.findMany({
      where: { patientId: patient.id },
      orderBy: { visitDate: 'desc' },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { records },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records',
      error: err.message,
    });
  }
};

export const getDoctorMedicalRecords = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const records = await prisma.medicalRecord.findMany({
      where: { doctorId: doctor.id },
      orderBy: { visitDate: 'desc' },
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { records },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records',
      error: err.message,
    });
  }
};

export const updateMedicalRecord = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const validation = updateMedicalRecordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const data = validation.data;

    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only registered doctors can edit medical records' });
    }

    const record = await prisma.medicalRecord.findUnique({
      where: { id },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    if (record.doctorId !== doctor.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit medical records charted by you',
      });
    }

    const updated = await prisma.medicalRecord.update({
      where: { id },
      data: {
        chiefComplaint: data.chiefComplaint,
        diagnosis: data.diagnosis,
        allergies: data.allergies,
        treatment: data.treatment,
        notes: data.notes,
        bloodPressure: data.bloodPressure,
        pulseRate: data.pulseRate,
        bodyTemperature: data.bodyTemperature,
        height: data.height,
        weight: data.weight,
        reportFile: data.reportFile,
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      data: { record: updated },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update medical record',
      error: err.message,
    });
  }
};

export const getAdminMedicalRecords = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const search = String(req.query.search || '').trim();
    const doctorSearch = String(req.query.doctor || '').trim();
    const dateFilter = req.query.date as string;

    const where: Prisma.MedicalRecordWhereInput = {};

    if (search) {
      where.patient = {
        user: {
          fullName: { contains: search, mode: 'insensitive' },
        },
      };
    }

    if (doctorSearch) {
      where.doctor = {
        user: {
          fullName: { contains: doctorSearch, mode: 'insensitive' },
        },
      };
    }

    if (dateFilter) {
      const targetDate = new Date(dateFilter);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.visitDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const records = await prisma.medicalRecord.findMany({
      where,
      orderBy: { visitDate: 'desc' },
      include: {
        patient: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { records },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records for admin',
      error: err.message,
    });
  }
};
