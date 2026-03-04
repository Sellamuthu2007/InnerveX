import Joi from 'joi';

export const signupSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().trim(),
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().min(8).max(128).required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }),
    role: Joi.string().valid('individual', 'institution', 'employer', 'regulatory').default('individual'),
    walletId: Joi.string().optional()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().lowercase().trim(),
    password: Joi.string().required()
});

export const verifyUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).required().trim()
});

export const sendOtpSchema = Joi.object({
    email: Joi.string().email().required().lowercase().trim()
});

export const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required().lowercase().trim(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
});
