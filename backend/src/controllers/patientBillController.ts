import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';

export const getPatientBills = async (req: Request, res: Response) => {
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

    const bills = await prisma.bill.findMany({
      where: { patientId: patient.id },
      orderBy: { generatedAt: 'desc' },
      include: {
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
      message: 'Failed to fetch patient bills',
      error: err.message,
    });
  }
};

export const getPatientBillById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

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

    if (bill.patientId !== patient.id) {
      return res.status(403).json({ success: false, message: 'Access denied to this invoice' });
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
