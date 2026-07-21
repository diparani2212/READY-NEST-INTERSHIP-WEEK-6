import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { createAppointmentSchema } from '../utils/patientValidation.js';
import { AppointmentStatus } from '@prisma/client';
import { emitToUser, emitToRole } from '../services/socketService.js';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const validation = createAppointmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { doctorId, appointmentDate, appointmentTime, reason } = validation.data;

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Validate appointment date is not in the past
    const targetDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date cannot be in the past',
      });
    }

    // Check doctor availability
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { user: true },
    });

    if (!doctor || !doctor.user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or profile deactivated',
      });
    }

    if (!doctor.availabilityStatus) {
      return res.status(400).json({
        success: false,
        message: `Dr. ${doctor.user.fullName} is currently unavailable for appointments`,
      });
    }

    // Check for scheduling time conflict
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingConflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        appointmentTime,
        status: {
          not: AppointmentStatus.CANCELLED,
        },
      },
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: `Dr. ${doctor.user.fullName} already has a confirmed or pending appointment at ${appointmentTime} on this date. Please select another time slot.`,
      });
    }

    // Default status = PENDING
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        appointmentDate: targetDate,
        appointmentTime,
        reason: reason || null,
        status: AppointmentStatus.PENDING,
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    emitToUser(doctor.userId, 'appointment:booked', appointment);
    emitToUser(patient.userId, 'appointment:booked', appointment);
    emitToRole('ADMIN', 'appointment:booked', appointment);

    return res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully',
      data: { appointment },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: err.message,
    });
  }
};

export const getMyAppointments = async (req: Request, res: Response) => {
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

    const statusParam = (req.query.status as string)?.toUpperCase();

    const where: any = {
      patientId: patient.id,
    };

    if (statusParam && Object.values(AppointmentStatus).includes(statusParam as any)) {
      where.status = statusParam;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { appointmentDate: 'desc' },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                profileImage: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { appointments },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: err.message,
    });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                fullName: true,
                email: true,
                phoneNumber: true,
                profileImage: true,
              },
            },
          },
        },
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

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment record not found' });
    }

    // Verify ownership
    if (appointment.patient.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden access to appointment' });
    }

    return res.status(200).json({
      success: true,
      data: { appointment },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment details',
      error: err.message,
    });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.patient.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only cancel your own appointments.' });
    }

    // Patient can ONLY cancel PENDING appointments
    if (appointment.status !== AppointmentStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment with status '${appointment.status}'. Only PENDING appointments can be cancelled by the patient.`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
    });

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment: updated },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: err.message,
    });
  }
};
