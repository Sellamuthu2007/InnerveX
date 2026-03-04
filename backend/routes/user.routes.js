import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { verifyUserSchema } from '../validators/auth.validator.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// POST /api/v1/users/verify - Verify if user exists by name
router.post('/verify', validate(verifyUserSchema), asyncHandler(async (req, res) => {
    const { name } = req.body;

    const user = await User.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
    }).select('name email walletId');

    if (user) {
        res.json({ 
            success: true, 
            name: user.name, 
            email: user.email,
            walletId: user.walletId
        });
    } else {
        res.status(404).json({ 
            success: false, 
            message: 'User not found in the registry' 
        });
    }
}));

// GET /api/v1/users/profile - Get user profile
router.get('/profile', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
}));

// PUT /api/v1/users/profile - Update user profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
    const { name } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    logger.info('User profile updated', { userId: user._id });

    res.json({ 
        message: 'Profile updated successfully',
        user: userObj 
    });
}));

export default router;
