import express from 'express';
import crypto from 'crypto';
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

    // Create share with explicit token generation
    const shareToken = crypto.randomBytes(32).toString('hex');
    const share = await Share.create({
        certificateId,
        recipientEmail,
        recipientId: recipient?._id || null,
        sharedByEmail: req.user.email,
        sharedById: req.userId,
        expiresAt: expiresAt || null,
        shareToken
    });

    console.log('✅ Share created with token:', share.shareToken);

    // Send email notification with secure link
    await sendCertificateSharedEmail(
        recipientEmail, 
        certificate.title, 
        req.user.name, 
        share.shareToken,
        share.expiresAt
    );

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
        recipientEmail,
        shareToken: share.shareToken
    });

    res.status(201).json({ 
        message: 'Certificate shared successfully', 
        share: {
            _id: share._id,
            certificateId: share.certificateId,
            recipientEmail: share.recipientEmail,
            expiresAt: share.expiresAt,
            shareToken: share.shareToken,
            shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared-view/${share.shareToken}`,
            createdAt: share.createdAt
        }
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

// GET /api/v1/shares/public/:token - Public view via share token (no authentication required)
router.get('/public/:token', asyncHandler(async (req, res) => {
    const { token } = req.params;

    // Find share by token
    const share = await Share.findOne({ 
        shareToken: token,
        isRevoked: false 
    })
        .populate('certificateId')
        .populate('sharedById', 'name email');

    if (!share) {
        return res.status(404).json({ 
            message: 'Invalid share link. This link may have been revoked or does not exist.' 
        });
    }

    // Check if expired
    if (share.isExpired) {
        return res.status(403).json({ 
            message: 'This share link has expired.',
            expiredAt: share.expiresAt
        });
    }

    // Check if certificate exists
    if (!share.certificateId) {
        return res.status(404).json({ 
            message: 'Certificate not found or has been removed.' 
        });
    }

    // Record access with details
    share.accessLog.push({
        accessedAt: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        country: req.get('cf-ipcountry') || 'Unknown',
        city: req.get('cf-ipcity') || 'Unknown'
    });
    
    await share.recordAccess();

    // Log access
    logger.info('Share accessed via public link', { 
        shareToken: token, 
        certificateId: share.certificateId._id,
        ip: req.ip 
    });

    // Return certificate and share details
    res.json({ 
        success: true,
        certificate: {
            _id: share.certificateId._id,
            title: share.certificateId.title,
            issuerName: share.certificateId.issuerName,
            recipientName: share.certificateId.recipientName,
            recipientEmail: share.certificateId.recipientEmail,
            status: share.certificateId.status,
            createdAt: share.certificateId.createdAt,
            fileData: share.certificateId.fileData,
            fileName: share.certificateId.fileName,
            fileType: share.certificateId.fileType,
            certificateHash: share.certificateId.certificateHash,
            metadata: share.certificateId.metadata
        },
        shareInfo: {
            sharedBy: share.sharedById?.name || share.sharedByEmail,
            sharedByEmail: share.sharedByEmail,
            sharedAt: share.createdAt,
            expiresAt: share.expiresAt,
            accessCount: share.accessCount
        }
    });
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

    // Send notification to recipient about revocation
    const recipient = await User.findOne({ email: share.recipientEmail });
    
    if (recipient) {
        await createNotification({
            userId: recipient._id,
            type: 'share_revoked',
            title: 'Certificate Share Revoked',
            message: `Access to a shared certificate has been revoked by ${req.user.name}`,
            relatedResourceType: 'share',
            relatedResourceId: share._id
        });
    }

    logger.info('Share revoked', { shareId: share._id, userId: req.userId });

    res.json({ message: 'Share revoked successfully' });
}));

// GET /api/v1/shares/analytics/:id - Get share analytics
router.get('/analytics/:id', protect, asyncHandler(async (req, res) => {
    const share = await Share.findById(req.params.id)
        .populate('certificateId', 'title')
        .lean();

    if (!share) {
        return res.status(404).json({ message: 'Share not found' });
    }

    // Check if user is the one who shared
    if (share.sharedById.toString() !== req.userId) {
        return res.status(403).json({ message: 'You can only view analytics for shares you created' });
    }

    // Calculate analytics
    const totalViews = share.accessCount || 0;
    const accessLog = share.accessLog || [];
    
    // Get unique IPs (approximation of unique viewers)
    const uniqueViewers = new Set(accessLog.map(log => log.ipAddress)).size;
    
    // Get locations
    const locations = accessLog
        .filter(log => log.country && log.country !== 'Unknown')
        .map(log => `${log.city}, ${log.country}`)
        .filter((v, i, a) => a.indexOf(v) === i); // unique
    
    // Device types (simplified detection from user agent)
    const deviceTypes = {
        mobile: accessLog.filter(log => 
            log.userAgent && /mobile|android|iphone|ipad/i.test(log.userAgent)
        ).length,
        desktop: accessLog.filter(log => 
            log.userAgent && !/mobile|android|iphone|ipad/i.test(log.userAgent)
        ).length
    };

    // Recent accesses (last 10)
    const recentAccesses = accessLog
        .sort((a, b) => new Date(b.accessedAt) - new Date(a.accessedAt))
        .slice(0, 10)
        .map(log => ({
            accessedAt: log.accessedAt,
            location: `${log.city}, ${log.country}`,
            device: /mobile|android|iphone|ipad/i.test(log.userAgent) ? 'Mobile' : 'Desktop'
        }));

    res.json({
        shareId: share._id,
        certificateTitle: share.certificateId?.title,
        recipientEmail: share.recipientEmail,
        totalViews,
        uniqueViewers,
        lastAccessedAt: share.lastAccessedAt,
        accessLocations: locations,
        deviceTypes,
        recentAccesses,
        sharedAt: share.createdAt,
        expiresAt: share.expiresAt,
        isExpired: share.isExpired,
        isRevoked: share.isRevoked
    });
}));

// POST /api/v1/shares/bulk - Bulk share certificates
router.post('/bulk', protect, asyncHandler(async (req, res) => {
    const { certificateId, recipients, expiresAt } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ message: 'Recipients array is required' });
    }

    if (recipients.length > 50) {
        return res.status(400).json({ message: 'Maximum 50 recipients per bulk share' });
    }

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

    const results = {
        success: [],
        failed: []
    };

    // Process each recipient
    for (const recipientEmail of recipients) {
        try {
            // Check if already shared
            const existingShare = await Share.findOne({
                certificateId,
                recipientEmail,
                isRevoked: false
            });

            if (existingShare && !existingShare.isExpired) {
                results.failed.push({
                    email: recipientEmail,
                    reason: 'Already shared with this recipient'
                });
                continue;
            }

            // Find recipient
            const recipient = await User.findOne({ email: recipientEmail });

            // Create share
            const share = await Share.create({
                certificateId,
                recipientEmail,
                recipientId: recipient?._id || null,
                sharedByEmail: req.user.email,
                sharedById: req.userId,
                expiresAt: expiresAt || null
            });

            // Send email notification
            await sendCertificateSharedEmail(
                recipientEmail,
                certificate.title,
                req.user.name,
                share.shareToken,
                share.expiresAt
            );

            // Create notification for recipient (if they have account)
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

            results.success.push({
                email: recipientEmail,
                shareId: share._id,
                shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared-view/${share.shareToken}`
            });

        } catch (error) {
            results.failed.push({
                email: recipientEmail,
                reason: error.message
            });
        }
    }

    // Create audit log
    await createAuditLog({
        userId: req.userId,
        action: 'bulk_certificate_share',
        resourceType: 'share',
        details: { 
            certificateId, 
            recipientCount: recipients.length,
            successCount: results.success.length,
            failedCount: results.failed.length
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('Bulk certificate share', {
        certificateId,
        sharedBy: req.userId,
        totalRecipients: recipients.length,
        successCount: results.success.length,
        failedCount: results.failed.length
    });

    res.status(201).json({
        message: `Shared with ${results.success.length} out of ${recipients.length} recipients`,
        results
    });
}));

export default router;
