import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Create write streams for logs
const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
    path.join(logsDir, 'error.log'),
    { flags: 'a' }
);

// Morgan middleware for access logs
export const accessLogger = morgan('combined', { stream: accessLogStream });

// Console logger for development
export const consoleLogger = morgan('dev');

// Custom logger utility
export const logger = {
    info: (message, meta = {}) => {
        const log = {
            level: 'INFO',
            timestamp: new Date().toISOString(),
            message,
            ...meta
        };
        console.log(JSON.stringify(log));
    },
    
    error: (message, error = {}, meta = {}) => {
        const log = {
            level: 'ERROR',
            timestamp: new Date().toISOString(),
            message,
            error: error.message || error,
            stack: error.stack,
            ...meta
        };
        console.error(JSON.stringify(log));
        errorLogStream.write(JSON.stringify(log) + '\n');
    },
    
    warn: (message, meta = {}) => {
        const log = {
            level: 'WARN',
            timestamp: new Date().toISOString(),
            message,
            ...meta
        };
        console.warn(JSON.stringify(log));
    },
    
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV === 'development') {
            const log = {
                level: 'DEBUG',
                timestamp: new Date().toISOString(),
                message,
                ...meta
            };
            console.debug(JSON.stringify(log));
        }
    }
};
