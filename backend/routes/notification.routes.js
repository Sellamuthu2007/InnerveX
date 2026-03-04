import express from 'express';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { 
    getUserNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
} from '../services/notification.service.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// GET /api/v1/notifications - Get user notifications
router.get('/', asyncHandler(async (req, res) => {
    const { unreadOnly, limit = 50, skip = 0 } = req.query;

    const result = await getUserNotifications(req.userId, {
        unreadOnly: unreadOnly === 'true',
        limit: parseInt(limit),
        skip: parseInt(skip)
    });

    res.json(result);
}));

// PUT /api/v1/notifications/:id/read - Mark notification as read
router.put('/:id/read', asyncHandler(async (req, res) => {
    const result = await markNotificationAsRead(req.params.id, req.userId);

    if (!result.success) {
        return res.status(404).json({ message: result.message });
    }

    res.json({ message: result.message });
}));

// PUT /api/v1/notifications/read-all - Mark all notifications as read
router.put('/read-all', asyncHandler(async (req, res) => {
    const result = await markAllNotificationsAsRead(req.userId);

    if (!result.success) {
        return res.status(500).json({ message: result.message });
    }

    res.json({ message: result.message });
}));

export default router;
