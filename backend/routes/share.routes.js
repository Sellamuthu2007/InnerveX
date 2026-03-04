import express from 'express';
import Share from '../models/Share.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { createShareSchema } from '../validators/share.validator.js';
import { sendCertificateSharedEmail } from '../utils/email.js';
import { createAuditLog } from '../services/auditLog.service.js';
import { createNotification } from '../services/notification.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// POST /api/v1/shares - Share a certificate
router.post('/', protect, validate(createShareSchema), asyncHandler(async (req, res) => {
    const { certificateId, recipientEmail, expiresAt } = req.body;

    // Check if certificate exists and user owns it
    const certificate = await Certificate.findById(certificateId);

    if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
    }

    if (certificate.recipientEmail !== req.user.email) {
        return res.status(403).json({ message: 'You can only share your own certificates' });
    }

    if (certificate.status !== 'verified') {
        return res.status(400).json({ message: 'Cannot share a revoked or pending certificate' });
    }

    // Find recipient
    const recipient = await User.findOne({ email: recipientEmail });

    // Check if already shared
    const existingShare = await Share.findOne({
        certificateId,
        recipientEmail,
        isRevoked: false
    });

    if (existingShare && !existingShare.isExpired) {
        return res.status(400).json({ message: 'Certificate already shared with this recipient' });
    }

    const share = await Share.create({
        certificateId,
        recipientEmail,
        recipientId: recipient?._id || null,
        sharedByEmail: req.user.email,
        sharedById: req.userId,
        expiresAt: expiresAt || null
    });

    // Send email notification
    await sendCertificateSharedEmail(recipientEmail, certificate.title, req.user.name);

    // Create notification for recipient
    if (recipient) {
        await createNotification({
            userId: recipient._id,
            type: 'certificate_shared',
            title: 'Certificate Shared With You',
            message: `${req.user.name} has shared a certificate with you: ${certificate.title}`,
            relatedResourceType: 'share',
            relatedResourceId: share._id
        });
    }

    // Create audit log
    await createAuditLog({
        userId: req.userId,
        action: 'certificate_shared',
        resourceType: 'share',
        resourceId: share._id,
        details: { certificateId, recipientEmail },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('Certificate shared', { 
        shareId: share._id, 
        certificateId, 
        sharedBy: req.userId, 
        recipientEmail 
    });

    res.status(201).json({ 
        message: 'Certificate shared successfully', 
        share 
    });
}));

// GET /api/v1/shares/my - Get certificates shared with user
router.get('/my', protect, asyncHandler(async (req, res) => {
    const { limit = 50, skip = 0 } = req.query;

    const shares = await Share.find({ 
        recipientEmail: req.user.email,
        isRevoked: false
    })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('certificateId')
        .populate('sharedById', 'name email')
        .lean();

    // Filter out expired shares and format response
    const validShares = shares
        .filter(share => share.certificateId && !share.isExpired)
        .map(share => {
            const cert = share.certificateId;
            return {
                id: cert._id,
                shareId: share._id,
                title: cert.title,
                issuer: cert.issuerName,
                recipient: cert.recipientName,
                sharedBy: share.sharedById?.name || share.sharedByEmail,
                sharedByEmail: share.sharedByEmail,
                date: share.createdAt,
                expiresAt: share.expiresAt,
                status: cert.status,
                fileData: cert.fileData || null,
                fileName: cert.fileName || null,
                fileType: cert.fileType || null
            };
        });

    const total = validShares.length;

    res.json({ 
        shares: validShares, 
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
    });
}));

// GET /api/v1/shares/sent - Get shares created by user
router.get('/sent', protect, asyncHandler(async (req, res) => {
    const { limit = 50, skip = 0 } = req.query;

    const shares = await Share.find({ sharedById: req.userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .populate('certificateId', 'title issuerName status')
        .lean();

    const total = await Share.countDocuments({ sharedById: req.userId });

    res.json({ 
        shares, 
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
    });
}));

// GET /api/v1/shares/:id - Get single share
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const share = await Share.findById(req.params.id)
        .populate('certificateId')
        .populate('sharedById', 'name email');

    if (!share) {
        return res.status(404).json({ message: 'Share not found' });
    }

    // Check if user has permission to view
    const canView = 
        share.recipientEmail === req.user.email ||
        share.sharedById._id.toString() === req.userId;

    if (!canView) {
        return res.status(403).json({ message: 'You do not have permission to view this share' });
    }

    if (share.isRevoked) {
        return res.status(400).json({ message: 'This share has been revoked' });
    }

    if (share.isExpired) {
        return res.status(400).json({ message: 'This share has expired' });
    }

    // Record access
    await share.recordAccess();

    res.json({ share });
}));

// DELETE /api/v1/shares/:id - Revoke share
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const share = await Share.findById(req.params.id);

    if (!share) {
        return res.status(404).json({ message: 'Share not found' });
    }

    // Check if user is the one who shared
    if (share.sharedById.toString() !== req.userId) {
        return res.status(403).json({ message: 'You can only revoke shares you created' });
    }

    await share.revoke();

    logger.info('Share revoked', { shareId: share._id, userId: req.userId });

    res.json({ message: 'Share revoked successfully' });
}));

export default router;
