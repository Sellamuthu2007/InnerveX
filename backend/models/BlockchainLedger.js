import mongoose from 'mongoose';

const BlockchainLedgerSchema = new mongoose.Schema({
    certificateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Certificate',
        required: [true, 'Certificate ID is required'],
        index: true
    },
    certificateHash: {
        type: String,
        required: [true, 'Certificate hash is required']
    },
    txHash: {
        type: String,
        required: [true, 'Transaction hash is required'],
        unique: true,
        index: true
    },
    blockNumber: {
        type: Number,
        required: [true, 'Block number is required'],
        index: true
    },
    issuerWallet: {
        type: String,
        required: [true, 'Issuer wallet address is required'],
        match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format']
    },
    network: {
        type: String,
        default: 'Polygon Mainnet',
        enum: ['Polygon Mainnet', 'Ethereum Mainnet', 'BSC Mainnet']
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'FAILED'],
        default: 'PENDING',
        index: true
    },
    gasUsed: {
        type: Number,
        required: true,
        min: 21000,
        max: 500000
    },
    anchoredAt: {
        type: Date,
        default: Date.now
    },
    revoked: {
        type: Boolean,
        default: false,
        index: true
    },
    revocationTxHash: {
        type: String,
        default: null
    },
    revokedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for performance
BlockchainLedgerSchema.index({ certificateId: 1, revoked: 1 });
BlockchainLedgerSchema.index({ status: 1, createdAt: -1 });
BlockchainLedgerSchema.index({ blockNumber: -1 });

// Virtual for explorer URL
BlockchainLedgerSchema.virtual('explorerUrl').get(function() {
    const baseUrls = {
        'Polygon Mainnet': 'https://polygonscan.com/tx/',
        'Ethereum Mainnet': 'https://etherscan.io/tx/',
        'BSC Mainnet': 'https://bscscan.com/tx/'
    };
    return baseUrls[this.network] + this.txHash;
});

// Virtual for revocation explorer URL
BlockchainLedgerSchema.virtual('revocationExplorerUrl').get(function() {
    if (!this.revocationTxHash) return null;
    const baseUrls = {
        'Polygon Mainnet': 'https://polygonscan.com/tx/',
        'Ethereum Mainnet': 'https://etherscan.io/tx/',
        'BSC Mainnet': 'https://bscscan.com/tx/'
    };
    return baseUrls[this.network] + this.revocationTxHash;
});

// Method to mark as confirmed
BlockchainLedgerSchema.methods.confirm = function() {
    this.status = 'CONFIRMED';
    return this.save();
};

// Method to revoke on-chain
BlockchainLedgerSchema.methods.revokeOnChain = function(revocationTxHash) {
    this.revoked = true;
    this.revokedAt = new Date();
    this.revocationTxHash = revocationTxHash;
    return this.save();
};

// Static method to get next block number
BlockchainLedgerSchema.statics.getNextBlockNumber = async function() {
    const lastBlock = await this.findOne().sort({ blockNumber: -1 }).select('blockNumber');
    return lastBlock ? lastBlock.blockNumber + 1 : 1000000; // Start from block 1,000,000
};

// Static method to find by certificate
BlockchainLedgerSchema.statics.findByCertificate = function(certificateId) {
    return this.findOne({ certificateId, revoked: false });
};

// Ensure virtuals are included in JSON
BlockchainLedgerSchema.set('toJSON', { virtuals: true });
BlockchainLedgerSchema.set('toObject', { virtuals: true });

export default mongoose.model('BlockchainLedger', BlockchainLedgerSchema);
