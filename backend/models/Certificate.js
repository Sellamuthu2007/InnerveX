import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    issuerName: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, required: true },
    status: { type: String, enum: ['verified', 'pending', 'revoked'], default: 'verified' },
    fileData: { type: String },      // base64-encoded file content
    fileName: { type: String },
    fileType: { type: String },      // e.g. 'application/pdf' or 'image/png'
}, {
    timestamps: true
});

export default mongoose.model('Certificate', CertificateSchema);
