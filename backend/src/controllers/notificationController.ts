import { Request, Response } from 'express';
import { prisma } from '../prisma/client.js';

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userId = req.user.userId;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user notifications',
      error: err.message,
    });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);
    const userId = req.user.userId;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied to this notification' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification: updated },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: err.message,
    });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userId = req.user.userId;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: err.message,
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const id = String(req.params.id);
    const userId = req.user.userId;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied to this notification' });
    }

    await prisma.notification.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: err.message,
    });
  }
};
