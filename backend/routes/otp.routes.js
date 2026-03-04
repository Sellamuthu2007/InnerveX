import express from 'express';
import { validate } from '../middleware/validate.js';
import { sendOtpSchema, verifyOtpSchema } from '../validators/auth.validator.js';
import { otpLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateOTP, storeOTP, verifyOTP } from '../utils/otp.js';
import { sendOTPEmail } from '../utils/email.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// POST /api/v1/otp/send - Send OTP
router.post('/send', otpLimiter, validate(sendOtpSchema), asyncHandler(async (req, res) => {
    const { email } = req.body;

    // Generate OTP
    const otp = generateOTP(6);

    // Store OTP
    storeOTP(email, otp, 10); // 10 minutes expiry

    // Send OTP via email
    const result = await sendOTPEmail(email, otp);

    if (!result.success) {
        logger.error('Failed to send OTP email', { email });
    }

    logger.info('OTP sent', { email });

    res.json({ 
        success: true, 
        message: 'OTP sent successfully',
        expiresIn: 600 // 10 minutes in seconds
    });
}));

// POST /api/v1/otp/verify - Verify OTP
router.post('/verify', validate(verifyOtpSchema), asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const result = verifyOTP(email, otp);

    if (!result.valid) {
        logger.warn('OTP verification failed', { email, reason: result.message });
        return res.status(400).json({ 
            success: false, 
            message: result.message 
        });
    }

    logger.info('OTP verified successfully', { email });

    res.json({ 
        success: true, 
        message: result.message 
    });
}));

export default router;
