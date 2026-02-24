import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['individual', 'institution', 'employer', 'regulatory'], 
        default: 'individual' 
    },
    walletId: { type: String },
    lastLogin: { type: Date }
}, {
    timestamps: true
});

export default mongoose.model('User', UserSchema);
