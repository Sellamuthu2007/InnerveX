import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'user_login',
            'user_logout',
            'user_signup',
            'certificate_issued',
            'certificate_viewed',
            'certificate_shared',
            'certificate_revoked',
            'request_created',
            'request_approved',
            'request_rejected',
            'profile_updated',
            'password_changed'
        ],
        index: true
    },
    resourceType: {
        type: String,
        enum: ['user', 'certificate', 'request', 'share', null]
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String,
    status: {
        type: String,
        enum: ['success', 'failure'],
        default: 'success'
    }
}, {
    timestamps: true
});

// Indexes for performance
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ createdAt: -1 });

// TTL index - auto-delete logs older than 90 days
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('AuditLog', AuditLogSchema);
