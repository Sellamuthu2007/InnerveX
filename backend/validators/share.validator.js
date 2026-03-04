import Joi from 'joi';

export const createShareSchema = Joi.object({
    certificateId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
        .messages({
            'string.pattern.base': 'Invalid certificate ID format'
        }),
    recipientEmail: Joi.string().email().required().lowercase().trim(),
    expiresAt: Joi.date().greater('now').optional().allow(null)
});
