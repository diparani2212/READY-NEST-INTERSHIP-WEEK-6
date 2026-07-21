import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { Prisma } from '@prisma/client';

export const getPublicDoctors = async (req: Request, res: Response) => {
  try {
    const search = String(req.query.search || '').trim();
    const department = String(req.query.department || '').trim();
    const specialization = String(req.query.specialization || '').trim();
    const sortBy = String(req.query.sortBy || 'createdAt'); // 'experience', 'fee_asc', 'fee_desc'

    const where: Prisma.DoctorWhereInput = {
      user: { isActive: true },
    };

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { department: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department) {
      where.department = { equals: department, mode: 'insensitive' };
    }

    if (specialization) {
      where.specialization = { equals: specialization, mode: 'insensitive' };
    }

    let orderBy: Prisma.DoctorOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'experience_desc') {
      orderBy = { experience: 'desc' };
    } else if (sortBy === 'fee_asc') {
      orderBy = { consultationFee: 'asc' };
    } else if (sortBy === 'fee_desc') {
      orderBy = { consultationFee: 'desc' };
    }

    const doctors = await prisma.doctor.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    // Extract unique departments & specializations for filter dropdowns
    const departments = Array.from(new Set(doctors.map((d) => d.department)));
    const specializations = Array.from(new Set(doctors.map((d) => d.specialization)));

    return res.status(200).json({
      success: true,
      data: {
        doctors,
        metadata: {
          departments,
          specializations,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor directory',
      error: err.message,
    });
  }
};

export const getPublicDoctorById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const doctor = await prisma.doctor.findFirst({
      where: {
        id,
        user: { isActive: true },
      },
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

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or unavailable',
      });
    }

    return res.status(200).json({
      success: true,
      data: { doctor },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor details',
      error: err.message,
    });
  }
};
