// File validation utilities

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB default
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'application/pdf,image/png,image/jpeg,image/jpg').split(',');

export const validateFile = (fileData, fileName, fileType) => {
    const errors = [];

    // Check if file data exists
    if (!fileData) {
        errors.push('File data is required');
        return { valid: false, errors };
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(fileType)) {
        errors.push(`File type ${fileType} is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    }

    // Check file size (base64 string length approximation)
    const base64Data = fileData.split(',')[1] || fileData;
    const sizeInBytes = (base64Data.length * 3) / 4;
    
    if (sizeInBytes > MAX_FILE_SIZE) {
        errors.push(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Check file name
    if (!fileName || fileName.length > 255) {
        errors.push('Invalid file name');
    }

    // Check for malicious file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.js', '.jar'];
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    
    if (dangerousExtensions.includes(fileExtension)) {
        errors.push('File type not allowed for security reasons');
    }

    return {
        valid: errors.length === 0,
        errors,
        size: sizeInBytes
    };
};

export const sanitizeFileName = (fileName) => {
    // Remove any path traversal attempts
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 255);
};
