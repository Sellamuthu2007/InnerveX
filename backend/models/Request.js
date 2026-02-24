import mongoose from 'mongoose';

const RequestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    institutionName: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    status: { type: String, enum: ['sent', 'approved', 'rejected'], default: 'sent' },
}, {
    timestamps: true
});

export default mongoose.model('Request', RequestSchema);
