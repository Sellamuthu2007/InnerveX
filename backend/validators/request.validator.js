import Joi from 'joi';

export const createRequestSchema = Joi.object({
    title: Joi.string().min(3).max(200).required().trim(),
    institutionName: Joi.string().min(2).max(100).required().trim()
});

export const updateRequestStatusSchema = Joi.object({
    status: Joi.string().valid('approved', 'rejected').required()
});
