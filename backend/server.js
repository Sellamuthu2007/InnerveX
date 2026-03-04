import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import middleware
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { accessLogger, consoleLogger } from './utils/logger.js';
import { sanitizeMiddleware } from './middleware/sanitize.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import requestRoutes from './routes/request.routes.js';
import shareRoutes from './routes/share.routes.js';
import otpRoutes from './routes/otp.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import collegeRoutes from './routes/college.routes.js';
import { protect } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security Middleware ───────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
})); // Security headers
app.use(sanitizeMiddleware); // Prevent NoSQL injection
app.use(compression()); // Compress responses

// ── CORS Configuration ────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://innerve-x-np7i.vercel.app',
    'https://innervex.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // In development, allow all localhost origins
        if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600 // Cache preflight for 10 minutes
}));

// ── Body Parser ───────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
    app.use(accessLogger);
} else {
    app.use(consoleLogger);
}

// ── MongoDB Connection ────────────────────────────────────────────
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Mongoose 6+ doesn't need these options
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();

// ── Health Check ──────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'InnerveX DigiBank API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
    });
});

// ── API Routes (v1) ───────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/certificates', apiLimiter, certificateRoutes);
app.use('/api/v1/requests', apiLimiter, requestRoutes);
app.use('/api/v1/shares', apiLimiter, shareRoutes);
app.use('/api/v1/otp', otpRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/colleges', collegeRoutes);

// ── Legacy Routes (for backward compatibility) ────────────────────
// These will be deprecated in future versions

// Map old routes to new ones
app.post('/api/signup', (req, res) => res.redirect(307, '/api/v1/auth/signup'));
app.post('/api/login', (req, res) => res.redirect(307, '/api/v1/auth/login'));
app.get('/api/me', (req, res) => res.redirect(307, '/api/v1/auth/me'));
app.post('/api/verify-user', (req, res) => res.redirect(307, '/api/v1/users/verify'));
app.post('/api/send-otp', (req, res) => res.redirect(307, '/api/v1/otp/send'));
app.post('/api/certificates', (req, res) => res.redirect(307, '/api/v1/certificates'));
app.get('/api/certificates/my', (req, res) => res.redirect(307, '/api/v1/certificates/my'));
app.get('/api/certificates/issued', (req, res) => res.redirect(307, '/api/v1/certificates/issued'));
app.get('/api/certificates/:id', (req, res) => res.redirect(307, `/api/v1/certificates/${req.params.id}`));
app.put('/api/certificates/:id/revoke', (req, res) => res.redirect(307, `/api/v1/certificates/${req.params.id}/revoke`));
app.get('/api/verify/:id', (req, res) => res.redirect(307, `/api/v1/certificates/verify/${req.params.id}`));
app.post('/api/requests', (req, res) => res.redirect(307, '/api/v1/requests'));
app.get('/api/requests/my', (req, res) => res.redirect(307, '/api/v1/requests/my'));
app.get('/api/requests/institution', (req, res) => res.redirect(307, '/api/v1/requests/institution'));
app.put('/api/requests/:id', (req, res) => res.redirect(307, `/api/v1/requests/${req.params.id}`));
app.post('/api/shares', (req, res) => res.redirect(307, '/api/v1/shares'));
app.get('/api/shares/my', (req, res) => res.redirect(307, '/api/v1/shares/my'));

// ── Error Handling ────────────────────────────────────────────────
app.use(notFound); // 404 handler
app.use(errorHandler); // Global error handler

// ── Graceful Shutdown ─────────────────────────────────────────────
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

// ── Start Server ──────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ═══════════════════════════════════════════════════');
    console.log(`   InnerveX DigiBank API Server`);
    console.log('   ═══════════════════════════════════════════════════');
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Server: http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log('   ═══════════════════════════════════════════════════');
    console.log('');
});

export default app;
