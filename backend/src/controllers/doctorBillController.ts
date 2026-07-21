import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';

export const getDoctorBills = async (req: Request, res: Response) => {
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

    const bills = await prisma.bill.findMany({
      where: {
        appointment: {
          doctorId: doctor.id,
        },
      },
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
        appointment: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { bills },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor billing log',
      error: err.message,
    });
  }
};
