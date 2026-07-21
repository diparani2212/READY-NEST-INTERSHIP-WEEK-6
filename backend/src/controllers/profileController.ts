import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';

export const uploadProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // Build URL e.g. /uploads/filename
    const fileUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { profileImage: fileUrl },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        profileImage: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        profileImage: updatedUser.profileImage,
        user: updatedUser,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: err.message,
    });
  }
};

export const removeProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: { profileImage: null },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        profileImage: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile image removed successfully',
      data: {
        profileImage: null,
        user: updatedUser,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to remove profile image',
      error: err.message,
    });
  }
};
