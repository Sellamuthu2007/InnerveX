import mongoose from 'mongoose';
import crypto from 'crypto';

const CertificateSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Certificate title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    issuerName: { 
        type: String, 
        required: [true, 'Issuer name is required'],
        trim: true
    },
    issuerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    recipientName: { 
        type: String, 
        required: [true, 'Recipient name is required'],
        trim: true
    },
    recipientEmail: { 
        type: String, 
        required: [true, 'Recipient email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    status: { 
        type: String, 
        enum: {
            values: ['verified', 'pending', 'revoked'],
            message: '{VALUE} is not a valid status'
        },
        default: 'verified',
        index: true
    },
    fileData: { type: String },
    fileName: { type: String, maxlength: 255 },
    fileType: { 
        type: String,
        enum: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', null]
    },
    fileSize: { type: Number },
    certificateHash: { type: String, sparse: true },
    revocationReason: { type: String },
    revokedAt: { type: Date },
    revokedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expiresAt: { type: Date },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Indexes for performance
CertificateSchema.index({ recipientEmail: 1, status: 1 });
CertificateSchema.index({ issuerName: 1, createdAt: -1 });
CertificateSchema.index({ issuerId: 1, createdAt: -1 });
CertificateSchema.index({ recipientId: 1, createdAt: -1 });
CertificateSchema.index({ status: 1, createdAt: -1 });
CertificateSchema.index({ certificateHash: 1 }, { unique: true, sparse: true });

// Virtual for checking if certificate is expired
CertificateSchema.virtual('isExpired').get(function() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Virtual for checking if certificate is valid
CertificateSchema.virtual('isValid').get(function() {
    return this.status === 'verified' && !this.isExpired;
});

// Method to revoke certificate
CertificateSchema.methods.revoke = function(reason, revokedBy) {
    this.status = 'revoked';
    this.revocationReason = reason;
    this.revokedAt = new Date();
    this.revokedBy = revokedBy;
    return this.save();
};

// Pre-save hook to generate certificate hash
CertificateSchema.pre('save', async function() {
    if (this.isNew && !this.certificateHash) {
        const hashData = `${this.title}-${this.issuerName}-${this.recipientEmail}-${Date.now()}`;
        this.certificateHash = crypto.createHash('sha256').update(hashData).digest('hex');
    }
});

export default mongoose.model('Certificate', CertificateSchema);
