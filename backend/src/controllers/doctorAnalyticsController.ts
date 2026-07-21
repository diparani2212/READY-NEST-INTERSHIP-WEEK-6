import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { AppointmentStatus } from '@prisma/client';

export const getDoctorDashboardAnalytics = async (req: Request, res: Response) => {
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

    const [
      todayCount,
      upcomingCount,
      completedCount,
      pendingCount,
      distinctPatients,
      recentPatients,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          appointmentDate: { gte: today, lte: endOfToday },
          status: { not: AppointmentStatus.CANCELLED },
        },
      }),
      prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          appointmentDate: { gt: endOfToday },
          status: { not: AppointmentStatus.CANCELLED },
        },
      }),
      prisma.appointment.count({
        where: { doctorId: doctor.id, status: AppointmentStatus.COMPLETED },
      }),
      prisma.appointment.count({
        where: { doctorId: doctor.id, status: AppointmentStatus.PENDING },
      }),
      prisma.appointment.findMany({
        where: { doctorId: doctor.id, status: AppointmentStatus.COMPLETED },
        select: { patientId: true },
        distinct: ['patientId'],
      }),
      prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        orderBy: { appointmentDate: 'desc' },
        take: 6,
        include: {
          patient: {
            include: {
              user: { select: { fullName: true, email: true, phoneNumber: true } },
            },
          },
        },
      }),
    ]);

    const totalPatientsTreated = distinctPatients.length;

    // Build last 7 days consultation breakdown
    const weeklyTrend: { day: string; consultations: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await prisma.appointment.count({
        where: {
          doctorId: doctor.id,
          appointmentDate: { gte: startOfDay, lte: endOfDay },
          status: { not: AppointmentStatus.CANCELLED },
        },
      });

      weeklyTrend.push({
        day: dayNames[d.getDay()],
        consultations: count,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          todayCount,
          upcomingCount,
          completedCount,
          pendingCount,
          totalPatientsTreated,
        },
        weeklyTrend,
        recentPatients,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor dashboard analytics',
      error: err.message,
    });
  }
};
