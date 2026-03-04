import crypto from 'crypto';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map();

// Generate OTP
export const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
        otp += digits[crypto.randomInt(0, digits.length)];
    }
    
    return otp;
};

// Store OTP with expiry
export const storeOTP = (email, otp, expiryMinutes = 10) => {
    const expiresAt = Date.now() + (expiryMinutes * 60 * 1000);
    
    otpStore.set(email, {
        otp,
        expiresAt,
        attempts: 0
    });
    
    // Auto-cleanup after expiry
    setTimeout(() => {
        otpStore.delete(email);
    }, expiryMinutes * 60 * 1000);
};

// Verify OTP
export const verifyOTP = (email, otp) => {
    const stored = otpStore.get(email);
    
    if (!stored) {
        return { valid: false, message: 'OTP not found or expired' };
    }
    
    if (Date.now() > stored.expiresAt) {
        otpStore.delete(email);
        return { valid: false, message: 'OTP expired' };
    }
    
    // Increment attempts
    stored.attempts += 1;
    
    if (stored.attempts > 3) {
        otpStore.delete(email);
        return { valid: false, message: 'Too many failed attempts' };
    }
    
    if (stored.otp !== otp) {
        return { valid: false, message: 'Invalid OTP' };
    }
    
    // Valid OTP - remove from store
    otpStore.delete(email);
    return { valid: true, message: 'OTP verified successfully' };
};

// Clear OTP
export const clearOTP = (email) => {
    otpStore.delete(email);
};
