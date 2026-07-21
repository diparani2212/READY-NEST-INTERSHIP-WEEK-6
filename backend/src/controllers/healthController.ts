import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';

export const getHealthStatus = async (_req: Request, res: Response) => {
  let dbConnected = false;
  let dbError: string | null = null;

  try {
    // Attempt database ping/query
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (err: any) {
    dbError = err.message || 'Database connection error';
  }

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    service: 'Smart Hospital Management System API',
    status: dbConnected ? 'UP' : 'DEGRADED',
    database: {
      connected: dbConnected,
      error: dbError,
    },
    timestamp: new Date().toISOString(),
  });
};
