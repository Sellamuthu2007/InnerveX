import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';

export const createNotification = async ({
    userId,
    type,
    title,
    message,
    relatedResourceType = null,
    relatedResourceId = null
}) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            relatedResourceType,
            relatedResourceId
        });
        
        logger.info('Notification created', { userId, type, notificationId: notification._id });
        return notification;
    } catch (error) {
        logger.error('Failed to create notification', error, { userId, type });
        return null;
    }
};

export const getUserNotifications = async (userId, { unreadOnly = false, limit = 50, skip = 0 } = {}) => {
    try {
        const query = { userId };
        if (unreadOnly) {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        return {
            notifications,
            total,
            unreadCount
        };
    } catch (error) {
        logger.error('Failed to fetch notifications', error, { userId });
        return { notifications: [], total: 0, unreadCount: 0 };
    }
};

export const markNotificationAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findOne({ _id: notificationId, userId });
        
        if (!notification) {
            return { success: false, message: 'Notification not found' };
        }

        if (notification.isRead) {
            return { success: true, message: 'Already marked as read' };
        }

        await notification.markAsRead();
        return { success: true, message: 'Notification marked as read' };
    } catch (error) {
        logger.error('Failed to mark notification as read', error, { notificationId, userId });
        return { success: false, message: 'Failed to update notification' };
    }
};

export const markAllNotificationsAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        return { success: true, message: 'All notifications marked as read' };
    } catch (error) {
        logger.error('Failed to mark all notifications as read', error, { userId });
        return { success: false, message: 'Failed to update notifications' };
    }
};
