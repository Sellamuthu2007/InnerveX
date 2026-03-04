import express from 'express';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { createCertificateSchema, revokeCertificateSchema } from '../validators/certificate.validator.js';
import { validateFile, sanitizeFileName } from '../utils/fileValidator.js';
import { sendCertificateIssuedEmail, sendCertificateRevokedEmail } from '../utils/email.js';
import { createAuditLog } from '../services/auditLog.service.js';
import { createNotification } from '../services/notification.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// POST /api/v1/certificates - Issue a certificate (institutions only)
router.post('/', protect, restrictTo('institution'), validate(createCertificateSchema), asyncHandler(async (req, res) => {
    const { title, issuerName, recipientName, recipientEmail, fileData, fileName, fileType, metadata } = req.body;

    // Validate file if provided
    if (fileData) {
        const validation = validateFile(fileData, fileName, fileType);
        if (!validation.valid) {
            return res.status(400).json({ 
                message: 'File validation failed', 
                errors: validation.errors 
            });
        }
    }

    // Find recipient user
    const recipient = await User.findOne({ email: recipientEmail });

    const cert = await Certificate.create({
        title,
        issuerName: issuerName || req.user.name,
        issuerId: req.userId,
        recipientName,
        recipientEmail,
        recipientId: recipient?._id || null,
        status: 'verified',
        fileData: fileData || null,
        fileName: fileName ? sanitizeFileName(fileName) : null,
        fileType: fileType || null,
        fileSize: fileData ? (fileData.length * 3) / 4 : 0,
        metadata: metadata || {},
        expiresAt: metadata?.expiryDate ? new Date(metadata.expiryDate) : null
    });

    // Update certificate counts
    const issuer = await User.findById(req.userId);
    if (issuer) {
        await issuer.incrementIssuedCount();
    }
    if (recipient) {
        await recipient.incrementReceivedCount();
    }

    // Send email notification
    await sendCertificateIssuedEmail(recipientEmail, title, issuerName || req.user.name);

    // Create notification for recipient
    if (recipient) {
        await createNotification({
            userId: recipient._id,
            type: 'certificate_issued',
            title: 'New Certificate Issued',
            message: `${issuerName || req.user.name} has issued you a certificate: ${title}`,
            relatedResourceType: 'certificate',
            relatedResourceId: cert._id
        });
    }

    // Create audit log
    await createAuditLog({
        userId: req.userId,
        action: 'certificate_issued',
        resourceType: 'certificate',
        resourceId: cert._id,
        details: { title, recipientEmail },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('Certificate issued', { 
        certificateId: cert._id, 
        issuerId: req.userId, 
        recipientEmail 
    });

    res.status(201).json({ 
        message: 'Certificate issued successfully', 
        certificate: cert 
    });
}));

// GET /api/v1/certificates/my - Get user's certificates
router.get('/my', protect, asyncHandler(async (req, res) => {
    const { status, limit = 50, skip = 0 } = req.query;

    const query = { recipientEmail: req.user.email };
    if (status) query.status = status;

    const certificates = await Certificate.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean();

    const total = await Certificate.countDocuments(query);

    res.json({ 
        certificates, 
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
    });
}));

// GET /api/v1/certificates/issued - Get certificates issued by institution
router.get('/issued', protect, restrictTo('institution'), asyncHandler(async (req, res) => {
    const { status, limit = 50, skip = 0 } = req.query;

    const query = { issuerId: req.userId };
    if (status) query.status = status;

    const certificates = await Certificate.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .lean();

    const total = await Certificate.countDocuments(query);

    res.json({ 
        certificates, 
        total,
        limit: parseInt(limit),
        skip: parseInt(skip)
    });
}));

// GET /api/v1/certificates/:id - Get single certificate
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const cert = await Certificate.findById(req.params.id)
        .populate('issuerId', 'name email')
        .populate('recipientId', 'name email');

    if (!cert) {
        return res.status(404).json({ message: 'Certificate not found' });
    }

    // Check if user has permission to view
    const canView = 
        cert.recipientEmail === req.user.email ||
        cert.issuerId?.toString() === req.userId ||
        ['employer', 'regulatory'].includes(req.userRole);

    if (!canView) {
        return res.status(403).json({ message: 'You do not have permission to view this certificate' });
    }

    // Create audit log
    await createAuditLog({
        userId: req.userId,
        action: 'certificate_viewed',
        resourceType: 'certificate',
        resourceId: cert._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    res.json({ certificate: cert });
}));

// PUT /api/v1/certificates/:id/revoke - Revoke certificate
router.put('/:id/revoke', protect, restrictTo('institution'), asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const cert = await Certificate.findById(req.params.id);

    if (!cert) {
        return res.status(404).json({ message: 'Certificate not found' });
    }

    // Check if user is the issuer
    if (cert.issuerId?.toString() !== req.userId) {
        return res.status(403).json({ message: 'You can only revoke certificates you issued' });
    }

    if (cert.status === 'revoked') {
        return res.status(400).json({ message: 'Certificate is already revoked' });
    }

    // Revoke certificate
    await cert.revoke(reason, req.userId);

    // Send email notification
    await sendCertificateRevokedEmail(
        cert.recipientEmail, 
        cert.title, 
        cert.issuerName, 
        reason
    );

    // Create notification for recipient
    if (cert.recipientId) {
        await createNotification({
            userId: cert.recipientId,
            type: 'certificate_revoked',
            title: 'Certificate Revoked',
            message: `Your certificate "${cert.title}" has been revoked${reason ? `: ${reason}` : ''}`,
            relatedResourceType: 'certificate',
            relatedResourceId: cert._id
        });
    }

    // Create audit log
    await createAuditLog({
        userId: req.userId,
        action: 'certificate_revoked',
        resourceType: 'certificate',
        resourceId: cert._id,
        details: { reason },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('Certificate revoked', { 
        certificateId: cert._id, 
        issuerId: req.userId, 
        reason 
    });

    res.json({ 
        message: 'Certificate revoked successfully', 
        certificate: cert 
    });
}));

// GET /api/v1/certificates/verify/:id - Public verification (no auth required)
router.get('/verify/:id', asyncHandler(async (req, res) => {
    const cert = await Certificate.findById(req.params.id)
        .select('title issuerName recipientName status createdAt certificateHash')
        .lean();

    if (!cert) {
        return res.status(404).json({ 
            valid: false, 
            message: 'Certificate not found' 
        });
    }

    res.json({
        valid: cert.status === 'verified',
        certificate: {
            id: cert._id,
            title: cert.title,
            issuerName: cert.issuerName,
            recipientName: cert.recipientName,
            status: cert.status,
            issueDate: cert.createdAt,
            certificateHash: cert.certificateHash
        }
    });
}));

export default router;
