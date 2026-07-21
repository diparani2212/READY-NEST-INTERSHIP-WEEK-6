import { prisma } from '../prisma/client.js';
import { logger } from '../utils/logger.js';
import { emitToUser } from './socketService.js';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });

    emitToUser(userId, 'notification:new', notification);

    logger.info(`Notification created for user ${userId} | Type: ${type}`);
    return notification;
  } catch (err: any) {
    logger.error(`Failed to create notification for user ${userId}: ${err.message}`);
    return null;
  }
}
