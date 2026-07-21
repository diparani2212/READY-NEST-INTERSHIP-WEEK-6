import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { createPrescriptionSchema, updatePrescriptionSchema } from '../utils/clinicalValidation.js';
import { AppointmentStatus, Role } from '@prisma/client';
import { createNotification } from '../services/notificationService.js';
import { sendEmail, generateEmailWrapper } from '../services/emailService.js';
import { emitToUser } from '../services/socketService.js';

export const createPrescription = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const validation = createPrescriptionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { appointmentId, patientId, diagnosis, medicines, dosage, instructions, followUpDate } = validation.data;

    // Fetch Doctor profile
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!doctor) {
      return res.status(403).json({ success: false, message: 'Only registered doctors can issue prescriptions' });
    }

    // Verify appointment status is COMPLETED and assigned doctor matches
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctorId !== doctor.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only issue prescriptions for appointments assigned to you',
      });
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Prescriptions can only be created for COMPLETED appointments',
      });
    }

    // Each appointment can have only one prescription
    const existingPrescription = await prisma.prescription.findFirst({
      where: { appointmentId },
    });

    if (existingPrescription) {
      return res.status(409).json({
        success: false,
        message: 'A prescription has already been issued for this appointment',
      });
    }

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        patientId,
        doctorId: doctor.id,
        diagnosis,
        medicines,
        dosage,
        instructions: instructions || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
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

    createNotification(
      prescription.patient.userId,
      'New Prescription Available',
      `Dr. ${prescription.doctor.user.fullName} issued a digital prescription for your visit: ${prescription.diagnosis}.`,
      'PRESCRIPTION_CREATED'
    );

    sendEmail({
      to: prescription.patient.user.email,
      subject: 'New Prescription Issued - CityCare Hospital',
      html: generateEmailWrapper(
        'Digital Prescription Available',
        `<p>Dear <strong>${prescription.patient.user.fullName}</strong>,</p>
         <p>Dr. <strong>${prescription.doctor.user.fullName}</strong> has issued a digital prescription for your consultation.</p>
         <p>Diagnosis: <strong>${prescription.diagnosis}</strong></p>
         <p>Log in to your patient portal to view medication instructions and download your printable Rx PDF.</p>`
      ),
    });

    emitToUser(prescription.patient.userId, 'prescription:created', prescription);

    return res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: { prescription },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: err.message,
    });
  }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const prescription = await prisma.prescription.findUnique({
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

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Role-based access validation
    if (req.user.role === Role.PATIENT) {
      // Must be patient owner
      if (prescription.patient.userId !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Access denied to this prescription' });
      }
    } else if (req.user.role === Role.DOCTOR) {
      // Must be assigned doctor
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.userId } });
      if (!doctor || prescription.doctorId !== doctor.id) {
        return res.status(403).json({ success: false, message: 'Access denied to this prescription' });
      }
    }

    return res.status(200).json({
      success: true,
      data: { prescription },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription details',
      error: err.message,
    });
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response) => {
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

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
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
      data: { prescriptions },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: err.message,
    });
  }
};

export const getDoctorPrescriptions = async (req: Request, res: Response) => {
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

    const prescriptions = await prisma.prescription.findMany({
      where: { doctorId: doctor.id },
      orderBy: { createdAt: 'desc' },
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
      data: { prescriptions },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: err.message,
    });
  }
};

export const updatePrescription = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const validation = updatePrescriptionSchema.safeParse(req.body);
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
      return res.status(403).json({ success: false, message: 'Only registered doctors can edit prescriptions' });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (prescription.doctorId !== doctor.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit prescriptions written by you',
      });
    }

    const updated = await prisma.prescription.update({
      where: { id },
      data: {
        diagnosis: data.diagnosis,
        medicines: data.medicines,
        dosage: data.dosage,
        instructions: data.instructions,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
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
      message: 'Prescription updated successfully',
      data: { prescription: updated },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
      error: err.message,
    });
  }
};
