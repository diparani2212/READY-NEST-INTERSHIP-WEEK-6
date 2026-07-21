import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { updateDoctorProfileSchema } from '../utils/doctorProfileValidation.js';
import { AppointmentStatus, Prisma } from '@prisma/client';
import { createNotification } from '../services/notificationService.js';
import { sendEmail, generateEmailWrapper } from '../services/emailService.js';
import { emitToUser, emitToRole } from '../services/socketService.js';

export const getDoctorProfile = async (req: Request, res: Response) => {
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
        doctor: true,
      },
    });

    if (!user || !user.doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        profile: {
          id: user.id,
          doctorId: user.doctor.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
          specialization: user.doctor.specialization,
          qualification: user.doctor.qualification,
          experience: user.doctor.experience,
          consultationFee: user.doctor.consultationFee,
          department: user.doctor.department,
          licenseNumber: user.doctor.licenseNumber,
          availabilityStatus: user.doctor.availabilityStatus,
          address: user.doctor.address,
          bio: user.doctor.bio,
          consultationDuration: user.doctor.consultationDuration,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor profile',
      error: err.message,
    });
  }
};

export const updateDoctorProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const validation = updateDoctorProfileSchema.safeParse(req.body);
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
      return res.status(404).json({ success: false, message: 'Doctor profile record not found' });
    }

    const userUpdate: Prisma.UserUpdateInput = {};
    if (data.phoneNumber !== undefined) userUpdate.phoneNumber = data.phoneNumber || null;

    const doctorUpdate: Prisma.DoctorUpdateInput = {};
    if (data.qualification !== undefined) doctorUpdate.qualification = data.qualification;
    if (data.experience !== undefined) doctorUpdate.experience = data.experience;
    if (data.consultationFee !== undefined) doctorUpdate.consultationFee = data.consultationFee;
    if (data.department !== undefined) doctorUpdate.department = data.department;
    if (data.specialization !== undefined) doctorUpdate.specialization = data.specialization;
    if (data.availabilityStatus !== undefined) doctorUpdate.availabilityStatus = data.availabilityStatus;
    if (data.address !== undefined) doctorUpdate.address = data.address || null;
    if (data.bio !== undefined) doctorUpdate.bio = data.bio || null;
    if (data.consultationDuration !== undefined) doctorUpdate.consultationDuration = data.consultationDuration;

    const updatedProfile = await prisma.$transaction(async (tx) => {
      if (Object.keys(userUpdate).length > 0) {
        await tx.user.update({
          where: { id: req.user!.userId },
          data: userUpdate,
        });
      }

      const updatedDoc = await tx.doctor.update({
        where: { id: doctor.id },
        data: doctorUpdate,
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

      return updatedDoc;
    });

    return res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: {
        profile: {
          id: updatedProfile.user.id,
          doctorId: updatedProfile.id,
          fullName: updatedProfile.user.fullName,
          email: updatedProfile.user.email,
          phoneNumber: updatedProfile.user.phoneNumber,
          profileImage: updatedProfile.user.profileImage,
          specialization: updatedProfile.specialization,
          qualification: updatedProfile.qualification,
          experience: updatedProfile.experience,
          consultationFee: updatedProfile.consultationFee,
          department: updatedProfile.department,
          licenseNumber: updatedProfile.licenseNumber,
          availabilityStatus: updatedProfile.availabilityStatus,
          address: updatedProfile.address,
          bio: updatedProfile.bio,
          consultationDuration: updatedProfile.consultationDuration,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile',
      error: err.message,
    });
  }
};

export const getDoctorDashboard = async (req: Request, res: Response) => {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Run parallel counts
    const [todayCount, upcomingCount, completedCount, pendingCount, recentAppointments] = await Promise.all([
      // Today's appointments count
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          appointmentDate: {
            gte: today,
            lte: endOfToday,
          },
          status: { not: AppointmentStatus.CANCELLED },
        },
      }),
      // Upcoming appointments count
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          appointmentDate: {
            gt: endOfToday,
          },
          status: { not: AppointmentStatus.CANCELLED },
        },
      }),
      // Completed count
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          status: AppointmentStatus.COMPLETED,
        },
      }),
      // Pending count
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          status: AppointmentStatus.PENDING,
        },
      }),
      // Latest 5 booked appointments
      prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
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
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          todayCount,
          upcomingCount,
          completedCount,
          pendingCount,
        },
        recentAppointments,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics',
      error: err.message,
    });
  }
};

export const getDoctorAppointments = async (req: Request, res: Response) => {
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

    const statusFilter = req.query.status as string;
    const filter = req.query.filter as string; // 'today' | 'upcoming' | 'all'
    const search = String(req.query.search || '').trim();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const where: Prisma.AppointmentWhereInput = {
      doctorId: doctor.id,
    };

    if (statusFilter && Object.values(AppointmentStatus).includes(statusFilter.toUpperCase() as any)) {
      where.status = statusFilter.toUpperCase() as AppointmentStatus;
    }

    if (filter === 'today') {
      where.appointmentDate = {
        gte: today,
        lte: endOfToday,
      };
    } else if (filter === 'upcoming') {
      where.appointmentDate = {
        gt: endOfToday,
      };
    }

    if (search) {
      where.patient = {
        user: {
          fullName: { contains: search, mode: 'insensitive' },
        },
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { appointmentDate: 'asc' },
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
      },
    });

    return res.status(200).json({
      success: true,
      data: { appointments },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor appointments',
      error: err.message,
    });
  }
};

export const getDoctorAppointmentById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const appointment = await prisma.appointment.findUnique({
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
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify appointment belongs to this doctor
    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!doctor || appointment.doctorId !== doctor.id) {
      return res.status(403).json({ success: false, message: 'Forbidden access to this appointment' });
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

export const confirmAppointment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.doctorId !== doctor.id) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only PENDING appointments can be confirmed
    if (appointment.status !== AppointmentStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Only PENDING appointments can be confirmed. Current status: ${appointment.status}`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CONFIRMED },
      include: { patient: { include: { user: true } } },
    });

    createNotification(
      updated.patient.userId,
      'Appointment Confirmed',
      `Your appointment scheduled for ${new Date(updated.appointmentDate).toLocaleDateString()} at ${updated.appointmentTime} has been confirmed.`,
      'APPOINTMENT_CONFIRMED'
    );

    sendEmail({
      to: updated.patient.user.email,
      subject: 'Appointment Confirmed - CityCare Hospital',
      html: generateEmailWrapper(
        'Appointment Confirmed',
        `<p>Dear <strong>${updated.patient.user.fullName}</strong>,</p>
         <p>Your appointment on <strong>${new Date(updated.appointmentDate).toLocaleDateString()}</strong> at <strong>${updated.appointmentTime}</strong> has been confirmed by your physician.</p>`
      ),
    });

    emitToUser(updated.patient.userId, 'appointment:confirmed', updated);
    emitToRole('ADMIN', 'appointment:confirmed', updated);

    return res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: { appointment: updated },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
      error: err.message,
    });
  }
};

export const rejectAppointment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.doctorId !== doctor.id) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only PENDING appointments can be rejected/cancelled
    if (appointment.status !== AppointmentStatus.PENDING) {
      return res.status(400).json({
        success: false,
        message: `Only PENDING appointments can be rejected. Current status: ${appointment.status}`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
      include: { patient: true },
    });

    emitToUser(updated.patient.userId, 'appointment:rejected', updated);
    emitToRole('ADMIN', 'appointment:rejected', updated);

    return res.status(200).json({
      success: true,
      message: 'Appointment rejected/cancelled successfully',
      data: { appointment: updated },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to reject appointment',
      error: err.message,
    });
  }
};

export const completeAppointment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.userId },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.doctorId !== doctor.id) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Only CONFIRMED appointments can be completed
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      return res.status(400).json({
        success: false,
        message: `Only CONFIRMED appointments can be marked as COMPLETED. Current status: ${appointment.status}`,
      });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.COMPLETED },
      include: { patient: true },
    });

    emitToUser(updated.patient.userId, 'appointment:completed', updated);
    emitToRole('ADMIN', 'appointment:completed', updated);

    return res.status(200).json({
      success: true,
      message: 'Appointment marked as COMPLETED successfully',
      data: { appointment: updated },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to complete appointment',
      error: err.message,
    });
  }
};

export const getDoctorPatientDetails = async (req: Request, res: Response) => {
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

    const patientId = String(req.params.id);

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
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
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Previous appointment history with this doctor
    const appointmentHistory = await prisma.appointment.findMany({
      where: {
        patientId: patient.id,
        doctorId: doctor.id,
      },
      orderBy: { appointmentDate: 'desc' },
      select: {
        id: true,
        appointmentDate: true,
        appointmentTime: true,
        reason: true,
        status: true,
        notes: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          fullName: patient.user.fullName,
          email: patient.user.email,
          phoneNumber: patient.user.phoneNumber,
          profileImage: patient.user.profileImage,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
          height: patient.height,
          weight: patient.weight,
          address: patient.address,
          emergencyContact: patient.emergencyContact,
        },
        appointmentHistory,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch patient details',
      error: err.message,
    });
  }
};
