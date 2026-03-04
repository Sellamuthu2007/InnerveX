import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Request title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    institutionName: { 
        type: String, 
        required: [true, 'Institution name is required'],
        trim: true
    },
    institutionId: {
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
        trim: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    status: { 
        type: String, 
        enum: {
            values: ['sent', 'approved', 'rejected'],
            message: '{VALUE} is not a valid status'
        },
        default: 'sent',
        index: true
    },
    rejectionReason: { type: String },
    processedAt: { type: Date },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for performance
RequestSchema.index({ recipientEmail: 1, status: 1 });
RequestSchema.index({ institutionName: 1, status: 1, createdAt: -1 });
RequestSchema.index({ institutionId: 1, status: 1, createdAt: -1 });
RequestSchema.index({ recipientId: 1, createdAt: -1 });

// Method to approve request
RequestSchema.methods.approve = function(processedBy) {
    this.status = 'approved';
    this.processedAt = new Date();
    this.processedBy = processedBy;
    return this.save();
};

// Method to reject request
RequestSchema.methods.reject = function(reason, processedBy) {
    this.status = 'rejected';
    this.rejectionReason = reason;
    this.processedAt = new Date();
    this.processedBy = processedBy;
    return this.save();
};

export default mongoose.model('Request', RequestSchema);
