import mongoose from 'mongoose';

const ShareSchema = new mongoose.Schema({
    certificateId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Certificate',
        required: true 
    },
    recipientEmail: { type: String, required: true },
    sharedByEmail: { type: String, required: true },
    expiresAt: { type: Date } // Optional expiration for the share link
}, {
    timestamps: true
});

export default mongoose.model('Share', ShareSchema);
