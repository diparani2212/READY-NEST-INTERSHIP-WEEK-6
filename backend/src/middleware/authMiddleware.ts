import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import { prisma } from '../prisma/client.js';
import { Role } from '@prisma/client';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const decoded = verifyAccessToken(token);

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User account not found or deactivated.',
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or expired token.',
    });
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};
