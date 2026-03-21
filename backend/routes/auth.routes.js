import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema } from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { protect } from '../middleware/auth.js';
import { createAuditLog } from '../services/auditLog.service.js';
import { validateCollege } from '../services/college.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'innervex_super_secret_key_2024';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// Helper: sign token
const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// POST /api/v1/auth/signup
router.post('/signup', authLimiter, validate(signupSchema), asyncHandler(async (req, res) => {
    const { name, email, password, role, walletId } = req.body;

    // Validate institution name if role is institution
    if (role === 'institution') {
        const validation = await validateCollege(name);
        
        if (!validation.valid) {
            return res.status(400).json({
                message: 'Invalid institution name. Please select from the list of registered institutions.',
                suggestions: validation.suggestions
            });
        }
        
        // Use the validated college name
        req.body.name = validation.college.name;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate wallet ID if not provided (valid Ethereum address format: 0x + 40 hex chars)
    const finalWalletId = walletId || ('0x' + crypto.randomBytes(20).toString('hex'));

    const newUser = await User.create({
        name: req.body.name, // Use validated name for institutions
        email,
        password: hashedPassword,
        role: role || 'individual',
        walletId: finalWalletId
    });

    const token = signToken(newUser);
    const userObj = newUser.toObject();
    delete userObj.password;

    // Create audit log
    await createAuditLog({
        userId: newUser._id,
        action: 'user_signup',
        resourceType: 'user',
        resourceId: newUser._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('User signed up', { userId: newUser._id, email, role: newUser.role });

    res.status(201).json({
        message: 'Account created successfully',
        token,
        user: userObj
    });
}));

// POST /api/v1/auth/login
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        await createAuditLog({
            userId: null,
            action: 'user_login',
            status: 'failure',
            details: { email, reason: 'User not found' },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        await createAuditLog({
            userId: user._id,
            action: 'user_login',
            status: 'failure',
            details: { reason: 'Invalid password' },
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
        return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user);
    const userObj = user.toObject();
    delete userObj.password;

    // Create audit log
    await createAuditLog({
        userId: user._id,
        action: 'user_login',
        resourceType: 'user',
        resourceId: user._id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('User logged in', { userId: user._id, email });

    res.json({
        message: 'Login successful',
        token,
        user: userObj
    });
}));

// GET /api/v1/auth/me - Get current user
router.get('/me', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
}));

// POST /api/v1/auth/logout
router.post('/logout', protect, asyncHandler(async (req, res) => {
    // Create audit log
    await createAuditLog({
        userId: req.userId,
        action: 'user_logout',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
    });

    logger.info('User logged out', { userId: req.userId });

    res.json({ message: 'Logged out successfully' });
}));

export default router;
