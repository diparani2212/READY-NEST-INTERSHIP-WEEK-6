import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { AppointmentStatus, PaymentStatus } from '@prisma/client';

export const getPatientDashboardAnalytics = async (req: Request, res: Response) => {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      upcomingCount,
      completedCount,
      cancelledCount,
      totalBills,
      paidBillsAggregate,
      pendingBillsAggregate,
      latestPrescription,
      latestMedicalRecord,
      nextAppointment,
    ] = await Promise.all([
      prisma.appointment.count({
        where: { patientId: patient.id, status: AppointmentStatus.CONFIRMED, appointmentDate: { gte: today } },
      }),
      prisma.appointment.count({
        where: { patientId: patient.id, status: AppointmentStatus.COMPLETED },
      }),
      prisma.appointment.count({
        where: { patientId: patient.id, status: AppointmentStatus.CANCELLED },
      }),
      prisma.bill.count({ where: { patientId: patient.id } }),
      prisma.bill.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { patientId: patient.id, paymentStatus: PaymentStatus.PAID },
      }),
      prisma.bill.aggregate({
        _count: { id: true },
        _sum: { amount: true },
        where: { patientId: patient.id, paymentStatus: PaymentStatus.PENDING },
      }),
      prisma.prescription.findFirst({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        include: {
          doctor: {
            include: { user: { select: { fullName: true } } },
          },
        },
      }),
      prisma.medicalRecord.findFirst({
        where: { patientId: patient.id },
        orderBy: { visitDate: 'desc' },
        include: {
          doctor: {
            include: { user: { select: { fullName: true } } },
          },
        },
      }),
      prisma.appointment.findFirst({
        where: {
          patientId: patient.id,
          appointmentDate: { gte: today },
          status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.PENDING] },
        },
        orderBy: { appointmentDate: 'asc' },
        include: {
          doctor: {
            include: { user: { select: { fullName: true } } },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        appointmentStats: {
          upcomingCount,
          completedCount,
          cancelledCount,
        },
        billStats: {
          totalBills,
          paidBillsCount: paidBillsAggregate._count.id || 0,
          paidAmount: paidBillsAggregate._sum.amount || 0,
          pendingBillsCount: pendingBillsAggregate._count.id || 0,
          pendingAmount: pendingBillsAggregate._sum.amount || 0,
        },
        latestPrescription,
        latestMedicalRecord,
        nextAppointment,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch patient dashboard analytics',
      error: err.message,
    });
  }
};
