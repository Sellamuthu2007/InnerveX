import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'certificate_issued',
            'certificate_shared',
            'certificate_revoked',
            'request_approved',
            'request_rejected',
            'request_received',
            'system_announcement'
        ],
        index: true
    },
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 1000
    },
    relatedResourceType: {
        type: String,
        enum: ['certificate', 'request', 'share', null]
    },
    relatedResourceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    readAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Indexes for performance
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// TTL index - auto-delete read notifications older than 30 days
NotificationSchema.index(
    { readAt: 1 }, 
    { expireAfterSeconds: 30 * 24 * 60 * 60, partialFilterExpression: { isRead: true } }
);

// Method to mark as read
NotificationSchema.methods.markAsRead = function() {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

export default mongoose.model('Notification', NotificationSchema);
