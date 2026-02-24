import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Certificate from './models/Certificate.js';
import Request from './models/Request.js';
import Share from './models/Share.js';

dotenv.config();

const app = express();
const PORT = 3001;

// ── JWT Secret ────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'innervex_super_secret_key_2024';
const JWT_EXPIRES = '7d'; // token valid for 7 days

// ── Helper: sign token ────────────────────────────────────────────
const signToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ── Middleware: verify token ──────────────────────────────────────
const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ message: 'Not authenticated' });

    try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// ── CORS ──────────────────────────────────────────────────────────
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://innerve-x-np7i.vercel.app',
        'https://innervex.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ── MongoDB ───────────────────────────────────────────────────────
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
    }
};

connectDB();

// ── Health check ──────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send('Innervex Backend is Live 🚀 (MongoDB Connected)');
});

// ─────────────────────────────────────────────────────────────────
// POST /api/signup
// ─────────────────────────────────────────────────────────────────
app.post('/api/signup', async (req, res) => {
    const { name, email, password, role, walletId } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ message: 'Missing required fields' });

    try {
        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: 'An account with this email already exists' });

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'individual',
            walletId: walletId || ('0x' + Math.random().toString(16).substr(2, 40))
        });

        const token = signToken(newUser);
        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: userObj
        });

    } catch (error) {
        // MongoDB duplicate key — email already taken (race condition bypass)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/login
// ─────────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });

    try {
        const user = await User.findOne({ email });

        if (!user)
            return res.status(401).json({ message: 'Invalid email or password' });

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
            return res.status(401).json({ message: 'Invalid email or password' });

        // ✅ Update lastLogin in DB
        user.lastLogin = new Date();
        await user.save();

        const token = signToken(user);
        const userObj = user.toObject();
        delete userObj.password;

        res.json({
            message: 'Login successful',
            token,
            user: userObj
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/me  (protected — re-hydrate session on page refresh)
// ─────────────────────────────────────────────────────────────────
app.get('/api/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/verify-user
// ─────────────────────────────────────────────────────────────────
app.post('/api/verify-user', async (req, res) => {
    const { name } = req.body;

    try {
        const user = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

        if (user) {
            res.json({ success: true, name: user.name, email: user.email });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/send-otp  (mock)
// ─────────────────────────────────────────────────────────────────
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: 'Email required' });

    const otp = '123456'; // Fixed for demo

    console.log(`\n================================`);
    console.log(`[EMAIL SIMULATION]`);
    console.log(`To: ${email}`);
    console.log(`Subject: Your Verification Code`);
    console.log(`Body: Your OTP is ${otp}`);
    console.log(`================================\n`);

    res.json({ success: true, message: 'OTP sent successfully' });
});

// ─────────────────────────────────────────────────────────────────
// POST /api/certificates  (institution issues a certificate)
// ─────────────────────────────────────────────────────────────────
app.post('/api/certificates', protect, async (req, res) => {
    const { title, issuerName, recipientName, recipientEmail, fileData, fileName, fileType } = req.body;

    if (!title || !recipientEmail || !recipientName)
        return res.status(400).json({ message: 'Missing required fields' });

    try {
        const cert = await Certificate.create({
            title,
            issuerName: issuerName || 'Unknown Institution',
            recipientName,
            recipientEmail,
            status: 'verified',
            fileData: fileData || null,
            fileName: fileName || null,
            fileType: fileType || null,
        });

        res.status(201).json({ message: 'Certificate issued', certificate: cert });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/certificates/my  (recipient fetches their certificates)
// ─────────────────────────────────────────────────────────────────
app.get('/api/certificates/my', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const certs = await Certificate.find({ recipientEmail: user.email }).sort({ createdAt: -1 });
        res.json({ certificates: certs });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/certificates/issued  (issuer fetches certificates they've issued)
// ─────────────────────────────────────────────────────────────────
app.get('/api/certificates/issued', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('name');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const certs = await Certificate.find({ issuerName: user.name }).sort({ createdAt: -1 });
        res.json({ certificates: certs });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/certificates/:id  (fetch a single certificate by ID)
// ─────────────────────────────────────────────────────────────────
app.get('/api/certificates/:id', protect, async (req, res) => {
    try {
        const cert = await Certificate.findById(req.params.id);
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });
        res.json({ certificate: cert });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/requests  (individual creates a certificate request)
// ─────────────────────────────────────────────────────────────────
app.post('/api/requests', protect, async (req, res) => {
    const { title, institutionName } = req.body;
    
    try {
        const user = await User.findById(req.userId).select('name email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const request = await Request.create({
            title,
            institutionName,
            recipientName: user.name,
            recipientEmail: user.email,
            status: 'sent'
        });

        res.status(201).json({ message: 'Request sent', request });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/requests/my  (individual fetches their requests)
// ─────────────────────────────────────────────────────────────────
app.get('/api/requests/my', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const requests = await Request.find({ recipientEmail: user.email }).sort({ createdAt: -1 });
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/requests/institution  (institution fetches its pending requests)
// ─────────────────────────────────────────────────────────────────
app.get('/api/requests/institution', protect, async (req, res) => {
    try {
        const institution = await User.findById(req.userId).select('name');
        if (!institution) return res.status(404).json({ message: 'Institution not found' });

        const requests = await Request.find({ institutionName: institution.name }).sort({ createdAt: -1 });
        res.json({ requests });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/requests/:id  (institution approves/rejects a request)
// ─────────────────────────────────────────────────────────────────
app.put('/api/requests/:id', protect, async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const request = await Request.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true }
        );
        
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // If approved, we could auto-mint the certificate here, or leave it to a separate flow
        // For now, we'll just update the status so the user knows.

        res.json({ message: `Request ${status}`, request });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/shares  (individual shares a certificate with an email)
// ─────────────────────────────────────────────────────────────────
app.post('/api/shares', protect, async (req, res) => {
    const { certificateId, recipientEmail, expiresAt } = req.body;
    
    try {
        const user = await User.findById(req.userId).select('email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const share = await Share.create({
            certificateId,
            recipientEmail,
            sharedByEmail: user.email,
            expiresAt: expiresAt || null
        });

        res.status(201).json({ message: 'Certificate shared', share });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/shares/my  (employer fetches certificates shared with them)
// ─────────────────────────────────────────────────────────────────
app.get('/api/shares/my', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('email');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Populate certificate details for the shared ones
        const shares = await Share.find({ recipientEmail: user.email })
            .populate('certificateId')
            .sort({ createdAt: -1 });

        // Transform into a format similar to normal certificates for the frontend
        const normalizedShares = shares
            .filter(share => share.certificateId) // ensure certificate still exists
            .map(share => {
                const cert = share.certificateId;
                return {
                    id: cert._id,
                    shareId: share._id,
                    title: cert.title,
                    issuer: cert.issuerName,
                    recipient: cert.recipientName, // the original recipient
                    sharedBy: share.sharedByEmail,
                    date: share.createdAt?.toISOString().split('T')[0] || '',
                    status: cert.status,
                    fileData: cert.fileData || null,
                    fileName: cert.fileName || null,
                    fileType: cert.fileType || null,
                };
            });

        res.json({ shares: normalizedShares });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// PUT /api/certificates/:id/revoke  (institution revokes a certificate)
// ─────────────────────────────────────────────────────────────────
app.put('/api/certificates/:id/revoke', protect, async (req, res) => {
    try {
        const cert = await Certificate.findById(req.params.id);
        if (!cert) return res.status(404).json({ message: 'Certificate not found' });

        // Update status to revoked
        cert.status = 'revoked';
        await cert.save();

        // Email simulation log
        console.log(`\n================================`);
        console.log(`[EMAIL SIMULATION]`);
        console.log(`To: ${cert.recipientEmail}`);
        console.log(`Subject: Important: Your Certificate has been Revoked`);
        console.log(`Body: Your certificate for "${cert.title}" issued by "${cert.issuerName}" has been permanently revoked.`);
        console.log(`================================\n`);

        res.json({ message: 'Certificate revoked successfully', certificate: cert });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/verify/:id  (Public Verification Route - NO AUTH REQUIRED)
// ─────────────────────────────────────────────────────────────────
app.get('/api/verify/:id', async (req, res) => {
    try {
        const cert = await Certificate.findById(req.params.id);
        if (!cert) return res.status(404).json({ valid: false, message: 'Certificate not found' });

        // Optionally, don't return the raw file data publicly, just the verification metadata
        res.json({
            valid: true,
            certificate: {
                id: cert._id,
                title: cert.title,
                issuerName: cert.issuerName,
                recipientName: cert.recipientName,
                status: cert.status,
                issueDate: cert.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ valid: false, message: 'Invalid ID format or Server Error' });
    }
});

// ─────────────────────────────────────────────────────────────────
const LISTEN_PORT = process.env.PORT || PORT;
app.listen(LISTEN_PORT, () => {
    console.log(`🚀 Server running on http://localhost:${LISTEN_PORT}`);
});
