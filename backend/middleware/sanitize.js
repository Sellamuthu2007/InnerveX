// Simple NoSQL injection prevention middleware
// Compatible with Express 5 (read-only req.query and req.params)

const sanitize = (obj) => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(sanitize);
    }

    const sanitized = {};
    for (const key in obj) {
        // Remove keys that start with $ or contain .
        if (key.startsWith('$') || key.includes('.')) {
            continue;
        }
        sanitized[key] = sanitize(obj[key]);
    }
    return sanitized;
};

export const sanitizeMiddleware = (req, res, next) => {
    // Only sanitize req.body (req.query and req.params are read-only in Express 5)
    if (req.body && typeof req.body === 'object') {
        req.body = sanitize(req.body);
    }
    next();
};
