import crypto from 'crypto';
import BlockchainLedger from '../models/BlockchainLedger.js';
import Certificate from '../models/Certificate.js';

/**
 * Blockchain Simulation Service
 * 
 * This service simulates blockchain anchoring for certificates.
 * It does NOT use real blockchain networks.
 * All transaction hashes, block numbers, and wallet addresses are simulated.
 */

class BlockchainService {
    /**
     * Generate a deterministic SHA-256 hash of certificate data
     * @param {Object} certificateData - Certificate object
     * @returns {String} SHA-256 hash
     */
    generateCertificateHash(certificateData) {
        // Create deterministic hash by using specific fields
        const dataToHash = {
            title: certificateData.title,
            issuerName: certificateData.issuerName,
            recipientName: certificateData.recipientName,
            recipientEmail: certificateData.recipientEmail,
            issuedAt: certificateData.createdAt || new Date().toISOString()
        };

        const hashString = JSON.stringify(dataToHash);
        return crypto.createHash('sha256').update(hashString).digest('hex');
    }

    /**
     * Generate a fake transaction hash (64 hex characters with 0x prefix)
     * @returns {String} Fake transaction hash
     */
    generateTxHash() {
        const randomBytes = crypto.randomBytes(32);
        return '0x' + randomBytes.toString('hex');
    }

    /**
     * Generate a fake wallet address (0x + 40 hex characters)
     * @returns {String} Fake wallet address
     */
    generateWalletAddress() {
        const randomBytes = crypto.randomBytes(20);
        return '0x' + randomBytes.toString('hex');
    }

    /**
     * Generate realistic gas used value
     * @returns {Number} Gas used (between 21000 and 100000)
     */
    generateGasUsed() {
        // Typical range: 21000 (simple transfer) to 100000 (smart contract interaction)
        const min = 21000;
        const max = 100000;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Simulate mining delay (1-2 seconds)
     * @returns {Promise} Resolves after random delay
     */
    simulateMiningDelay() {
        const delay = Math.floor(Math.random() * 1000) + 1000; // 1-2 seconds
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Anchor certificate to simulated blockchain
     * @param {String} certificateId - MongoDB certificate ID
     * @param {Object} certificateData - Certificate data
     * @param {String} issuerWallet - Optional issuer wallet (will generate if not provided)
     * @returns {Promise<Object>} Blockchain ledger entry
     */
    async anchorCertificate(certificateId, certificateData, issuerWallet = null) {
        try {
            // Check if already anchored
            const existing = await BlockchainLedger.findOne({ certificateId });
            if (existing) {
                console.log(`Certificate ${certificateId} already anchored to blockchain`);
                return existing;
            }

            // Generate certificate hash
            const certificateHash = this.generateCertificateHash(certificateData);

            // Generate blockchain transaction data
            const txHash = this.generateTxHash();
            const blockNumber = await BlockchainLedger.getNextBlockNumber();
            const gasUsed = this.generateGasUsed();
            const wallet = issuerWallet || this.generateWalletAddress();

            // Create pending blockchain entry
            const ledgerEntry = new BlockchainLedger({
                certificateId,
                certificateHash,
                txHash,
                blockNumber,
                issuerWallet: wallet,
                network: 'Polygon Mainnet',
                status: 'PENDING',
                gasUsed,
                anchoredAt: new Date(),
                revoked: false
            });

            await ledgerEntry.save();

            console.log(`⛓️  Certificate ${certificateId} anchoring to blockchain...`);
            console.log(`   TxHash: ${txHash}`);
            console.log(`   Block: ${blockNumber}`);
            console.log(`   Network: Polygon Mainnet`);

            // Simulate mining delay and confirm transaction
            this.simulateMiningDelay().then(async () => {
                await ledgerEntry.confirm();
                console.log(`✅ Certificate ${certificateId} confirmed on blockchain`);
            });

            return ledgerEntry;
        } catch (error) {
            console.error('Blockchain anchoring error:', error);
            throw new Error('Failed to anchor certificate to blockchain');
        }
    }

    /**
     * Revoke certificate on simulated blockchain
     * @param {String} certificateId - MongoDB certificate ID
     * @returns {Promise<Object>} Updated blockchain ledger entry
     */
    async revokeCertificateOnChain(certificateId) {
        try {
            // Find existing blockchain entry
            const ledgerEntry = await BlockchainLedger.findOne({ certificateId });
            
            if (!ledgerEntry) {
                throw new Error('Certificate not found on blockchain');
            }

            if (ledgerEntry.revoked) {
                console.log(`Certificate ${certificateId} already revoked on blockchain`);
                return ledgerEntry;
            }

            // Generate revocation transaction
            const revocationTxHash = this.generateTxHash();

            console.log(`⛓️  Revoking certificate ${certificateId} on blockchain...`);
            console.log(`   Revocation TxHash: ${revocationTxHash}`);

            // Simulate mining delay
            await this.simulateMiningDelay();

            // Update ledger entry
            await ledgerEntry.revokeOnChain(revocationTxHash);

            console.log(`✅ Certificate ${certificateId} revoked on blockchain`);

            return ledgerEntry;
        } catch (error) {
            console.error('Blockchain revocation error:', error);
            throw new Error('Failed to revoke certificate on blockchain');
        }
    }

    /**
     * Verify certificate on simulated blockchain
     * @param {String} certificateId - MongoDB certificate ID
     * @returns {Promise<Object>} Verification result
     */
    async verifyCertificateOnChain(certificateId) {
        try {
            const ledgerEntry = await BlockchainLedger.findOne({ certificateId });

            if (!ledgerEntry) {
                return {
                    anchored: false,
                    message: 'Certificate not found on blockchain'
                };
            }

            // Get certificate data to verify hash
            const certificate = await Certificate.findById(certificateId);
            if (!certificate) {
                return {
                    anchored: false,
                    message: 'Certificate not found in database'
                };
            }

            // Verify hash matches
            const currentHash = this.generateCertificateHash(certificate);
            const hashMatches = currentHash === ledgerEntry.certificateHash;

            return {
                anchored: true,
                verified: hashMatches && ledgerEntry.status === 'CONFIRMED',
                certificateHash: ledgerEntry.certificateHash,
                currentHash: currentHash,
                hashMatches,
                txHash: ledgerEntry.txHash,
                blockNumber: ledgerEntry.blockNumber,
                network: ledgerEntry.network,
                status: ledgerEntry.status,
                gasUsed: ledgerEntry.gasUsed,
                issuerWallet: ledgerEntry.issuerWallet,
                anchoredAt: ledgerEntry.anchoredAt,
                revoked: ledgerEntry.revoked,
                revokedAt: ledgerEntry.revokedAt,
                revocationTxHash: ledgerEntry.revocationTxHash,
                explorerUrl: ledgerEntry.explorerUrl,
                revocationExplorerUrl: ledgerEntry.revocationExplorerUrl
            };
        } catch (error) {
            console.error('Blockchain verification error:', error);
            throw new Error('Failed to verify certificate on blockchain');
        }
    }

    /**
     * Get blockchain info for certificate (for embedding in certificate responses)
     * @param {String} certificateId - MongoDB certificate ID
     * @returns {Promise<Object|null>} Blockchain info or null
     */
    async getBlockchainInfo(certificateId) {
        try {
            const ledgerEntry = await BlockchainLedger.findOne({ certificateId });

            if (!ledgerEntry) {
                return null;
            }

            return {
                anchored: true,
                txHash: ledgerEntry.txHash,
                blockNumber: ledgerEntry.blockNumber,
                network: ledgerEntry.network,
                status: ledgerEntry.status,
                explorerUrl: ledgerEntry.explorerUrl,
                anchoredAt: ledgerEntry.anchoredAt,
                revoked: ledgerEntry.revoked
            };
        } catch (error) {
            console.error('Error fetching blockchain info:', error);
            return null;
        }
    }

    /**
     * Get blockchain statistics
     * @returns {Promise<Object>} Statistics
     */
    async getBlockchainStats() {
        try {
            const totalAnchored = await BlockchainLedger.countDocuments();
            const totalConfirmed = await BlockchainLedger.countDocuments({ status: 'CONFIRMED' });
            const totalRevoked = await BlockchainLedger.countDocuments({ revoked: true });
            const lastBlock = await BlockchainLedger.findOne().sort({ blockNumber: -1 });

            return {
                totalCertificatesAnchored: totalAnchored,
                totalConfirmed,
                totalRevoked,
                latestBlockNumber: lastBlock ? lastBlock.blockNumber : 0,
                network: 'Polygon Mainnet',
                simulationMode: true
            };
        } catch (error) {
            console.error('Error fetching blockchain stats:', error);
            throw new Error('Failed to fetch blockchain statistics');
        }
    }

    /**
     * Get recent blockchain transactions
     * @param {Number} limit - Number of transactions to fetch
     * @returns {Promise<Array>} Recent transactions
     */
    async getRecentTransactions(limit = 10) {
        try {
            const transactions = await BlockchainLedger.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('certificateId', 'title issuerName recipientName')
                .lean();

            return transactions.map(tx => ({
                txHash: tx.txHash,
                blockNumber: tx.blockNumber,
                status: tx.status,
                network: tx.network,
                gasUsed: tx.gasUsed,
                anchoredAt: tx.anchoredAt,
                revoked: tx.revoked,
                explorerUrl: this._getExplorerUrl(tx.network, tx.txHash),
                certificate: tx.certificateId ? {
                    title: tx.certificateId.title,
                    issuerName: tx.certificateId.issuerName,
                    recipientName: tx.certificateId.recipientName
                } : null
            }));
        } catch (error) {
            console.error('Error fetching recent transactions:', error);
            throw new Error('Failed to fetch recent transactions');
        }
    }

    /**
     * Helper to generate explorer URL
     * @private
     */
    _getExplorerUrl(network, txHash) {
        const baseUrls = {
            'Polygon Mainnet': 'https://polygonscan.com/tx/',
            'Ethereum Mainnet': 'https://etherscan.io/tx/',
            'BSC Mainnet': 'https://bscscan.com/tx/'
        };
        return baseUrls[network] + txHash;
    }

    /**
     * Batch anchor multiple certificates
     * @param {Array} certificates - Array of {certificateId, certificateData}
     * @returns {Promise<Array>} Array of blockchain ledger entries
     */
    async batchAnchorCertificates(certificates) {
        const results = [];
        
        for (const cert of certificates) {
            try {
                const ledgerEntry = await this.anchorCertificate(
                    cert.certificateId,
                    cert.certificateData,
                    cert.issuerWallet
                );
                results.push({
                    success: true,
                    certificateId: cert.certificateId,
                    ledgerEntry
                });
            } catch (error) {
                results.push({
                    success: false,
                    certificateId: cert.certificateId,
                    error: error.message
                });
            }
        }

        return results;
    }
}

// Export singleton instance
export default new BlockchainService();
