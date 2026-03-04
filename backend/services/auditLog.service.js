import AuditLog from '../models/AuditLog.js';
import { logger } from '../utils/logger.js';

export const createAuditLog = async ({
    userId,
    action,
    resourceType = null,
    resourceId = null,
    details = {},
    ipAddress = null,
    userAgent = null,
    status = 'success'
}) => {
    try {
        await AuditLog.create({
            userId,
            action,
            resourceType,
            resourceId,
            details,
            ipAddress,
            userAgent,
            status
        });
    } catch (error) {
        logger.error('Failed to create audit log', error, { userId, action });
    }
};

export const getUserAuditLogs = async (userId, limit = 50) => {
    try {
        return await AuditLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();
    } catch (error) {
        logger.error('Failed to fetch user audit logs', error, { userId });
        return [];
    }
};

export const getResourceAuditLogs = async (resourceType, resourceId, limit = 50) => {
    try {
        return await AuditLog.find({ resourceType, resourceId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'name email')
            .lean();
    } catch (error) {
        logger.error('Failed to fetch resource audit logs', error, { resourceType, resourceId });
        return [];
    }
};
