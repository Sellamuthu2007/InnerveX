import mongoose from 'mongoose';
import crypto from 'crypto';

const ShareSchema = new mongoose.Schema({
    certificateId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Certificate',
        required: [true, 'Certificate ID is required'],
        index: true
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
    sharedByEmail: { 
        type: String, 
        required: [true, 'Shared by email is required'],
        lowercase: true,
        trim: true
    },
    sharedById: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    expiresAt: { type: Date },
    shareToken: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    accessCount: {
        type: Number,
        default: 0
    },
    lastAccessedAt: { type: Date },
    accessLog: [{
        accessedAt: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
        country: String,
        city: String
    }],
    isRevoked: {
        type: Boolean,
        default: false
    },
    revokedAt: { type: Date }
}, {
    timestamps: true
});

// Indexes for performance
ShareSchema.index({ recipientEmail: 1, createdAt: -1 });
ShareSchema.index({ sharedById: 1, createdAt: -1 });
ShareSchema.index({ certificateId: 1, recipientEmail: 1 });
ShareSchema.index({ expiresAt: 1 });
// shareToken index already defined in schema

// Generate unique share token before save
ShareSchema.pre('save', async function() {
    if (this.isNew && !this.shareToken) {
        this.shareToken = crypto.randomBytes(32).toString('hex');
    }
});

// Virtual for checking if share is expired
ShareSchema.virtual('isExpired').get(function() {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
});

// Virtual for checking if share is valid
ShareSchema.virtual('isValid').get(function() {
    return !this.isRevoked && !this.isExpired;
});

// Method to record access
ShareSchema.methods.recordAccess = function() {
    this.accessCount += 1;
    this.lastAccessedAt = new Date();
    return this.save();
};

// Method to revoke share
ShareSchema.methods.revoke = function() {
    this.isRevoked = true;
    this.revokedAt = new Date();
    return this.save();
};

export default mongoose.model('Share', ShareSchema);
