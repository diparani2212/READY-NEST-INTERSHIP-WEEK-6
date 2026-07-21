import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { AppointmentStatus, PaymentStatus, Prisma } from '@prisma/client';

export const getAdminDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Parallel count queries
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      completedAppointments,
      cancelledAppointments,
      paidBillsAggregate,
      pendingBillsAggregate,
      doctorsGroupedByDept,
      appointmentsByStatusGroup,
      latestAppointments,
      recentBills,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          appointmentDate: { gte: today, lte: endOfToday },
        },
      }),
      prisma.appointment.count({
        where: { status: AppointmentStatus.COMPLETED },
      }),
      prisma.appointment.count({
        where: { status: AppointmentStatus.CANCELLED },
      }),
      prisma.bill.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: PaymentStatus.PAID },
      }),
      prisma.bill.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: PaymentStatus.PENDING },
      }),
      prisma.doctor.groupBy({
        by: ['department'],
        _count: { id: true },
      }),
      prisma.appointment.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.appointment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          patient: {
            include: {
              user: { select: { fullName: true, email: true } },
            },
          },
          doctor: {
            include: {
              user: { select: { fullName: true } },
            },
          },
        },
      }),
      prisma.bill.findMany({
        orderBy: { generatedAt: 'desc' },
        take: 5,
        include: {
          patient: {
            include: {
              user: { select: { fullName: true, email: true } },
            },
          },
        },
      }),
    ]);

    const totalRevenue = paidBillsAggregate._sum.amount || 0;
    const pendingPayments = pendingBillsAggregate._sum.amount || 0;

    // Build monthly revenue trend (last 6 months)
    const monthlyRevenue: { month: string; revenue: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthPaid = await prisma.bill.aggregate({
        _sum: { amount: true },
        where: {
          paymentStatus: PaymentStatus.PAID,
          generatedAt: { gte: startOfMonth, lte: endOfMonth },
        },
      });

      monthlyRevenue.push({
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        revenue: monthPaid._sum.amount || 0,
      });
    }

    // Build department distribution
    const departmentDoctors = doctorsGroupedByDept.map((g) => ({
      department: g.department,
      count: g._count.id,
    }));

    // Build status summary
    const statusMap: Record<string, number> = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
    appointmentsByStatusGroup.forEach((g) => {
      statusMap[g.status] = g._count.id;
    });

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalPatients,
          totalDoctors,
          totalAppointments,
          todayAppointments,
          completedAppointments,
          cancelledAppointments,
          totalRevenue,
          pendingPayments,
        },
        monthlyRevenue,
        departmentDoctors,
        appointmentStatusSummary: statusMap,
        latestAppointments,
        recentBills,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard analytics',
      error: err.message,
    });
  }
};

export const getAppointmentReports = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const search = String(req.query.search || '').trim();
    const statusFilter = req.query.status as string;
    const doctorFilter = req.query.doctor as string;
    const departmentFilter = req.query.department as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const where: Prisma.AppointmentWhereInput = {};

    if (statusFilter && Object.values(AppointmentStatus).includes(statusFilter.toUpperCase() as any)) {
      where.status = statusFilter.toUpperCase() as AppointmentStatus;
    }

    if (startDate && endDate) {
      where.appointmentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search || doctorFilter || departmentFilter) {
      where.AND = [
        search
          ? {
              patient: {
                user: {
                  fullName: { contains: search, mode: 'insensitive' },
                },
              },
            }
          : {},
        doctorFilter
          ? {
              doctor: {
                user: {
                  fullName: { contains: doctorFilter, mode: 'insensitive' },
                },
              },
            }
          : {},
        departmentFilter
          ? {
              doctor: {
                department: { contains: departmentFilter, mode: 'insensitive' },
              },
            }
          : {},
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { appointmentDate: 'desc' },
      include: {
        patient: {
          include: {
            user: { select: { fullName: true, email: true, phoneNumber: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { fullName: true } },
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
      message: 'Failed to fetch appointment reports',
      error: err.message,
    });
  }
};

export const getRevenueReports = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const search = String(req.query.search || '').trim();
    const statusFilter = req.query.status as string;
    const paymentMethodFilter = req.query.paymentMethod as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const where: Prisma.BillWhereInput = {};

    if (statusFilter && Object.values(PaymentStatus).includes(statusFilter.toUpperCase() as any)) {
      where.paymentStatus = statusFilter.toUpperCase() as PaymentStatus;
    }

    if (paymentMethodFilter) {
      where.paymentMethod = { contains: paymentMethodFilter, mode: 'insensitive' };
    }

    if (startDate && endDate) {
      where.generatedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        {
          patient: {
            user: { fullName: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const bills = await prisma.bill.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      include: {
        patient: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
        appointment: {
          include: {
            doctor: {
              include: { user: { select: { fullName: true } } },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { bills },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue reports',
      error: err.message,
    });
  }
};

export const getPatientReports = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const search = String(req.query.search || '').trim();

    const where: Prisma.PatientWhereInput = {};
    if (search) {
      where.user = {
        fullName: { contains: search, mode: 'insensitive' },
      };
    }

    const patients = await prisma.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, phoneNumber: true } },
        _count: {
          select: {
            appointments: true,
            medicalRecords: true,
            bills: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { patients },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch patient reports',
      error: err.message,
    });
  }
};

export const getDoctorReports = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const search = String(req.query.search || '').trim();
    const department = req.query.department as string;

    const where: Prisma.DoctorWhereInput = {};
    if (department) {
      where.department = { contains: department, mode: 'insensitive' };
    }
    if (search) {
      where.user = {
        fullName: { contains: search, mode: 'insensitive' },
      };
    }

    const doctors = await prisma.doctor.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true, phoneNumber: true } },
        _count: {
          select: {
            appointments: true,
            prescriptions: true,
            medicalRecords: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { doctors },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor reports',
      error: err.message,
    });
  }
};
