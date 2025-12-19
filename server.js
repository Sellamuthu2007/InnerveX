import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

const USERS_FILE = path.join(__dirname, 'users.json');

// Helper to read users
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([]));
        return [];
    }
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
};

// Helper to write users
const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Signup Endpoint
app.post('/api/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    const users = readUsers();
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password, // In a real app, hash this!
        role: role || 'individual',
        walletId: '0x' + Math.random().toString(16).substr(2, 40) // Mock Wallet Gen
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'User created successfully', user: { ...newUser, password: undefined } });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();
    
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({ 
            message: 'Login successful', 
            user: { ...user, password: undefined } 
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Verify User by Name
app.post('/api/verify-user', (req, res) => {
    const { name } = req.body;
    const users = readUsers();
    
    // Case-insensitive search
    const user = users.find(u => u.name && u.name.toLowerCase() === name.toLowerCase());

    if (user) {
        res.json({ 
            success: true, 
            name: user.name, 
            email: user.email 
        });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});

// Mock Send OTP (Simulate Email)
app.post('/api/send-otp', (req, res) => {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: 'Email required' });

    const otp = '123456'; // Fixed for demo, or generate random
    
    console.log(`\n================================`);
    console.log(`[EMAIL SIMULATION]`);
    console.log(`To: ${email}`);
    console.log(`Subject: Your Verification Code`);
    console.log(`Body: Your OTP is ${otp}`);
    console.log(`================================\n`);

    res.json({ success: true, message: 'OTP sent successfully' });
});

// Handle React Routing (Catch-all)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Use process.env.PORT for deployment
const LISTEN_PORT = process.env.PORT || PORT;

app.listen(LISTEN_PORT, () => {
    console.log(`Server running on http://localhost:${LISTEN_PORT}`);
});
