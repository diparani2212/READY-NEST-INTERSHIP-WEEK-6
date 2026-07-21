import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';
import { Role, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

export const uploadMedicalReportFile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No report file uploaded' });
    }

    const { patientId, medicalRecordId, fileName } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    // Verify patient exists
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // If user is doctor, get doctor profile
    let doctorId: string | null = null;
    if (req.user.role === Role.DOCTOR) {
      const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.userId } });
      if (doctor) doctorId = doctor.id;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const displayFileName = fileName || req.file.originalname;

    const uploadedFile = await prisma.uploadedFile.create({
      data: {
        patientId,
        doctorId: doctorId || null,
        medicalRecordId: medicalRecordId || null,
        fileName: displayFileName,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      },
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
    });

    // If medicalRecordId is provided, link report file URL
    if (medicalRecordId) {
      await prisma.medicalRecord.update({
        where: { id: medicalRecordId },
        data: { reportFile: fileUrl },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Medical report file uploaded successfully',
      data: { file: uploadedFile },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload report file',
      error: err.message,
    });
  }
};

export const getMedicalReportFileById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const file = await prisma.uploadedFile.findUnique({
      where: { id },
      include: {
        patient: {
          include: { user: { select: { fullName: true, email: true } } },
        },
        doctor: {
          include: { user: { select: { fullName: true } } },
        },
      },
    });

    if (!file) {
      return res.status(404).json({ success: false, message: 'File record not found' });
    }

    return res.status(200).json({
      success: true,
      data: { file },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch file details',
      error: err.message,
    });
  }
};

export const deleteMedicalReportFile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const file = await prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File record not found' });
    }

    // Try deleting physical file from disk if local
    if (file.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), file.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.uploadedFile.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: err.message,
    });
  }
};

export const getAdminFiles = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const search = String(req.query.search || '').trim();
    const fileType = req.query.fileType as string;
    const patientId = req.query.patientId as string;
    const doctorId = req.query.doctorId as string;

    const where: Prisma.UploadedFileWhereInput = {};

    if (fileType) {
      if (fileType.toLowerCase() === 'pdf') {
        where.fileType = 'application/pdf';
      } else if (fileType.toLowerCase() === 'image') {
        where.fileType = { startsWith: 'image/' };
      }
    }

    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: 'insensitive' } },
        {
          patient: {
            user: { fullName: { contains: search, mode: 'insensitive' } },
          },
        },
      ];
    }

    const files = await prisma.uploadedFile.findMany({
      where,
      orderBy: { uploadedAt: 'desc' },
      include: {
        patient: {
          include: { user: { select: { fullName: true, email: true } } },
        },
        doctor: {
          include: { user: { select: { fullName: true } } },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: { files },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch files for admin',
      error: err.message,
    });
  }
};

export const deleteAdminFile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);

    const file = await prisma.uploadedFile.findUnique({ where: { id } });
    if (!file) {
      return res.status(404).json({ success: false, message: 'File record not found' });
    }

    if (file.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), file.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.uploadedFile.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'File record permanently deleted',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: err.message,
    });
  }
};
