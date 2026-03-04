import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'innervex_super_secret_key_2024';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authenticated. Please login.' });
        }

        const token = authHeader.split(' ')[1];
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Attach user to request
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            req.userId = decoded.id;
            req.user = user;
            req.userRole = decoded.role;
            
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token expired. Please login again.' });
            }
            return res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Authentication error' });
    }
};

// Restrict to specific roles
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userRole)) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};
