import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { createBillSchema, updateBillSchema } from '../utils/billingValidation.js';
import { AppointmentStatus, PaymentStatus, Prisma } from '@prisma/client';
import { createNotification } from '../services/notificationService.js';
import { sendEmail, generateEmailWrapper } from '../services/emailService.js';
import { emitToUser, emitToRole } from '../services/socketService.js';

export const createBill = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const validation = createBillSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const {
      appointmentId,
      consultationFee,
      additionalCharges,
      discount,
      tax,
      paymentStatus,
      paymentMethod,
    } = validation.data;

    // Fetch appointment & check status COMPLETED
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        message: 'Bills can only be generated for COMPLETED appointments',
      });
    }

    // Check single bill rule
    const existingBill = await prisma.bill.findFirst({
      where: { appointmentId },
    });

    if (existingBill) {
      return res.status(409).json({
        success: false,
        message: 'A bill has already been generated for this appointment',
      });
    }

    // Total = Consultation Fee + Additional Charges - Discount + Tax
    const totalAmount = Math.max(0, consultationFee + additionalCharges - discount + tax);

    // Invoice Number Generation
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    const bill = await prisma.bill.create({
      data: {
        patientId: appointment.patientId,
        appointmentId,
        consultationFee,
        additionalCharges,
        discount,
        tax,
        amount: totalAmount,
        paymentStatus,
        paymentMethod: paymentMethod || null,
        invoiceNumber,
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
        appointment: {
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
        },
      },
    });

    createNotification(
      bill.patient.userId,
      'New Medical Invoice Generated',
      `Invoice #${bill.invoiceNumber} for amount $${bill.amount.toFixed(2)} has been generated for your consultation.`,
      'BILL_GENERATED'
    );

    sendEmail({
      to: bill.patient.user.email,
      subject: `Invoice #${bill.invoiceNumber} - CityCare Hospital`,
      html: generateEmailWrapper(
        'Medical Tax Invoice',
        `<p>Dear <strong>${bill.patient.user.fullName}</strong>,</p>
         <p>A new billing statement has been generated for your consultation visit.</p>
         <p>Invoice Number: <strong>#${bill.invoiceNumber}</strong></p>
         <p>Total Amount: <strong>$${bill.amount.toFixed(2)}</strong></p>
         <p>Payment Status: <strong>${bill.paymentStatus}</strong></p>`
      ),
    });

    emitToUser(bill.patient.userId, 'bill:generated', bill);
    emitToRole('ADMIN', 'bill:generated', bill);

    return res.status(201).json({
      success: true,
      message: 'Bill generated successfully',
      data: { bill },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate bill',
      error: err.message,
    });
  }
};

export const getAdminBills = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const search = String(req.query.search || '').trim();
    const statusFilter = req.query.status as string;
    const dateFilter = req.query.date as string;

    const where: Prisma.BillWhereInput = {};

    if (statusFilter && Object.values(PaymentStatus).includes(statusFilter.toUpperCase() as any)) {
      where.paymentStatus = statusFilter.toUpperCase() as PaymentStatus;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        {
          patient: {
            user: {
              fullName: { contains: search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    if (dateFilter) {
      const targetDate = new Date(dateFilter);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.generatedAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const bills = await prisma.bill.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
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
        appointment: {
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
      message: 'Failed to fetch bills for admin',
      error: err.message,
    });
  }
};

export const getAdminBillById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const bill = await prisma.bill.findUnique({
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
        appointment: {
          include: {
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
          },
        },
      },
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill record not found' });
    }

    return res.status(200).json({
      success: true,
      data: { bill },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bill details',
      error: err.message,
    });
  }
};

export const updateBill = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const validation = updateBillSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const data = validation.data;

    const existing = await prisma.bill.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Bill record not found' });
    }

    const consultationFee = data.consultationFee !== undefined ? data.consultationFee : existing.consultationFee;
    const additionalCharges = data.additionalCharges !== undefined ? data.additionalCharges : existing.additionalCharges;
    const discount = data.discount !== undefined ? data.discount : existing.discount;
    const tax = data.tax !== undefined ? data.tax : existing.tax;

    const totalAmount = Math.max(0, consultationFee + additionalCharges - discount + tax);

    const updated = await prisma.bill.update({
      where: { id },
      data: {
        consultationFee,
        additionalCharges,
        discount,
        tax,
        amount: totalAmount,
        paymentStatus: data.paymentStatus !== undefined ? data.paymentStatus : existing.paymentStatus,
        paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod : existing.paymentMethod,
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

    emitToUser(updated.patient.userId, 'bill:updated', updated);
    emitToRole('ADMIN', 'bill:updated', updated);

    return res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: { bill: updated },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update bill',
      error: err.message,
    });
  }
};

export const deleteBill = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const existing = await prisma.bill.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Bill record not found' });
    }

    await prisma.bill.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Bill deleted successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete bill',
      error: err.message,
    });
  }
};
