import express from 'express';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { createRequestSchema, updateRequestStatusSchema } from '../validators/request.validator.js';
import { createAuditLog } from '../services/auditLog.service.js';
import { createNotification } from '../services/notification.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// POST /api/v1/requests - Create certificate request
router.post('/', protect, restrictTo('individual'), validate(createRequestSchema), asyncHandler(async (req, res) => {
    const { title, institutionName } = req.body;

    // Find institution
    const institution = await User.findOne({ 
        name: { $regex: new RegExp(`^${institutionName}$`, 'i') },
        role: 'institution'
    });

    const request = await Request.create({
        title,
        institutionName,
        institutionId: institution?._id || null,
        recipientName: req.user.name,
        recipientEmail: req.user.email,
        recipientId: req.userId,
        status: 'sent'
    });

    // Create notification for institution
    if (institution) {
        await createNotification({
            userId: institution._id,
            type: 'request_received',
            title: 'New Certificate Request',
            message: `${req.user.name} has requested a certificate: ${title}`,
            relatedResourceType: 'request',
            relatedResourceId: request._id
        });
    }

    // Create audit log
    await createAuditLog({
        userId: req.userId,
        action: 'request_created',
        resourceType: 'request',
        resourceId: request._id,
        details: { title, institutionName },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('Certificate request created', { 
        requestId: request._id, 
        userId: req.userId, 
        institutionName 
    });

    res.status(201).json({ 
        message: 'Request sent successfully', 
        request 
    });
}));

// GET /api/v1/requests/my - Get user's requests
router.get('/my', protect, restrictTo('individual'), asyncHandler(async (req, res) => {
    const { status, limit = 50, skip = 0 } = req.query;

    const query = { recipientId: req.userId };
    if (status) query.status = status;

    const requests = await Request.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean();

    const total = await Request.countDocuments(query);

    res.json({ 
        requests, 
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
    });
}));

// GET /api/v1/requests/institution - Get institution's requests
router.get('/institution', protect, restrictTo('institution'), asyncHandler(async (req, res) => {
    const { status, limit = 50, skip = 0 } = req.query;

    // Match by institutionId OR by institution name (for requests sent before signup)
    const query = {
        $or: [
            { institutionId: req.userId },
            { 
                institutionName: { $regex: new RegExp(`^${req.user.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
                institutionId: null // Only match name if institutionId is not set
            }
        ]
    };
    
    if (status) query.status = status;

    const requests = await Request.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('recipientId', 'name email walletId')
        .lean();

    const total = await Request.countDocuments(query);

    // Update institutionId for requests that match by name
    const updatePromises = requests
        .filter(r => !r.institutionId)
        .map(r => Request.findByIdAndUpdate(r._id, { institutionId: req.userId }));
    
    if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        logger.info('Updated institutionId for pending requests', { 
            count: updatePromises.length, 
            institutionId: req.userId 
        });
    }

    res.json({ 
        requests, 
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
    });
}));

// PUT /api/v1/requests/:id - Update request status
router.put('/:id', protect, restrictTo('institution'), validate(updateRequestStatusSchema), asyncHandler(async (req, res) => {
    const { status } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
        return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is the institution
    if (request.institutionId?.toString() !== req.userId) {
        return res.status(403).json({ message: 'You can only process requests sent to you' });
    }

    if (request.status !== 'sent') {
        return res.status(400).json({ message: 'Request has already been processed' });
    }

    // Update request
    if (status === 'approved') {
        await request.approve(req.userId);
    } else {
        await request.reject(req.body.reason || 'No reason provided', req.userId);
    }

    // Create notification for requester
    if (request.recipientId) {
        await createNotification({
            userId: request.recipientId,
            type: status === 'approved' ? 'request_approved' : 'request_rejected',
            title: `Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `Your certificate request "${request.title}" has been ${status}`,
            relatedResourceType: 'request',
            relatedResourceId: request._id
        });
    }

    // Create audit log
    await createAuditLog({
        userId: req.userId,
        action: status === 'approved' ? 'request_approved' : 'request_rejected',
        resourceType: 'request',
        resourceId: request._id,
        details: { status },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('Request status updated', { 
        requestId: request._id, 
        status, 
        processedBy: req.userId 
    });

    res.json({ 
        message: `Request ${status}`, 
        request 
    });
}));

export default router;
