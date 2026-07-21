import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/token.js';
import { logger } from '../utils/logger.js';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

let io: Server | null = null;

export function initSocketServer(httpServer: HttpServer): Server {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  io = new Server(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // JWT Authentication Middleware for Socket Connection
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      let token = socket.handshake.auth?.token;

      // Check cookie if token not in auth payload
      if (!token && socket.handshake.headers.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';').reduce((acc, cookie) => {
          const [key, val] = cookie.trim().split('=');
          acc[key] = val;
          return acc;
        }, {} as Record<string, string>);
        token = cookies['accessToken'];
      }

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (err: any) {
      logger.error(`Socket auth failed: ${err.message}`);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    if (!socket.user) return;

    const { userId, role } = socket.user;
    logger.info(`Socket connected | User ID: ${userId} | Role: ${role} | Socket ID: ${socket.id}`);

    // Join user room & role room
    socket.join(`user:${userId}`);
    socket.join(`role:${role}`);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected | Socket ID: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO server has not been initialized');
  }
  return io;
}

export function emitToUser(userId: string, event: string, payload: any) {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}

export function emitToRole(role: string, event: string, payload: any) {
  if (io) {
    io.to(`role:${role}`).emit(event, payload);
  }
}

export function emitToAll(event: string, payload: any) {
  if (io) {
    io.emit(event, payload);
  }
}
