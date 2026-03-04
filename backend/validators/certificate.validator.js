import Joi from 'joi';

export const createCertificateSchema = Joi.object({
    title: Joi.string().min(3).max(200).required().trim(),
    issuerName: Joi.string().min(2).max(100).required().trim(),
    recipientName: Joi.string().min(2).max(100).required().trim(),
    recipientEmail: Joi.string().email().required().lowercase().trim(),
    fileData: Joi.string().optional().allow(null, ''),
    fileName: Joi.string().max(255).optional().allow(null, ''),
    fileType: Joi.string().valid('application/pdf', 'image/png', 'image/jpeg', 'image/jpg').optional().allow(null, '')
});

export const revokeCertificateSchema = Joi.object({
    reason: Joi.string().min(10).max(500).optional().trim()
});
