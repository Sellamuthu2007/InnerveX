import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't return password by default
    },
    role: { 
        type: String, 
        enum: {
            values: ['individual', 'institution', 'employer', 'regulatory'],
            message: '{VALUE} is not a valid role'
        },
        default: 'individual' 
    },
    walletId: { 
        type: String,
        unique: true,
        sparse: true // Allow multiple null values
    },
    lastLogin: { type: Date },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    certificatesIssued: {
        type: Number,
        default: 0,
        min: 0
    },
    certificatesReceived: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for user's full profile
UserSchema.virtual('profile').get(function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        role: this.role,
        walletId: this.walletId,
        isVerified: this.isVerified
    };
});

// Method to check if user can issue certificates
UserSchema.methods.canIssueCertificates = function() {
    return this.role === 'institution' && this.isVerified;
};

// Method to check if user can verify certificates
UserSchema.methods.canVerifyCertificates = function() {
    return ['employer', 'regulatory', 'institution'].includes(this.role);
};

// Method to increment certificates issued count
UserSchema.methods.incrementIssuedCount = async function() {
    this.certificatesIssued += 1;
    return this.save();
};

// Method to increment certificates received count
UserSchema.methods.incrementReceivedCount = async function() {
    this.certificatesReceived += 1;
    return this.save();
};

export default mongoose.model('User', UserSchema);
