import express from 'express';
import blockchainService from '../services/blockchainService.js';
import { protect } from '../middleware/auth.js';
import Certificate from '../models/Certificate.js';

const router = express.Router();

/**
 * @route   GET /api/v1/blockchain/verify/:certificateId
 * @desc    Public verification endpoint - Verify certificate on blockchain
 * @access  Public
 */
router.get('/verify/:certificateId', async (req, res) => {
    try {
        const { certificateId } = req.params;

        // Validate certificateId format
        if (!certificateId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid certificate ID format'
            });
        }

        const verificationResult = await blockchainService.verifyCertificateOnChain(certificateId);

        res.json({
            success: true,
            data: verificationResult
        });
    } catch (error) {
        console.error('Blockchain verification error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to verify certificate on blockchain'
        });
    }
});

/**
 * @route   POST /api/v1/blockchain/anchor/:certificateId
 * @desc    Manually anchor certificate to blockchain (admin/institution only)
 * @access  Protected
 */
router.post('/anchor/:certificateId', protect, async (req, res) => {
    try {
        const { certificateId } = req.params;
        const { issuerWallet } = req.body;

        // Validate wallet address format if provided
        if (issuerWallet && !/^0x[a-fA-F0-9]{40}$/.test(issuerWallet)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid wallet address format. Must be 0x followed by 40 hexadecimal characters.'
            });
        }

        // Check if certificate exists
        const certificate = await Certificate.findById(certificateId);
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Check if user is authorized (issuer or admin)
        if (
            certificate.issuerId?.toString() !== req.user._id.toString() &&
            req.user.role !== 'regulatory'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to anchor this certificate'
            });
        }

        const ledgerEntry = await blockchainService.anchorCertificate(
            certificateId,
            certificate,
            issuerWallet
        );

        res.status(201).json({
            success: true,
            message: 'Certificate anchored to blockchain',
            data: {
                certificateId: ledgerEntry.certificateId,
                txHash: ledgerEntry.txHash,
                blockNumber: ledgerEntry.blockNumber,
                network: ledgerEntry.network,
                status: ledgerEntry.status,
                explorerUrl: ledgerEntry.explorerUrl,
                anchoredAt: ledgerEntry.anchoredAt
            }
        });
    } catch (error) {
        console.error('Blockchain anchoring error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to anchor certificate to blockchain'
        });
    }
});

/**
 * @route   POST /api/v1/blockchain/revoke/:certificateId
 * @desc    Revoke certificate on blockchain
 * @access  Protected
 */
router.post('/revoke/:certificateId', protect, async (req, res) => {
    try {
        const { certificateId } = req.params;

        // Check if certificate exists
        const certificate = await Certificate.findById(certificateId);
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Check if user is authorized (issuer or admin)
        if (
            certificate.issuerId?.toString() !== req.user._id.toString() &&
            req.user.role !== 'regulatory'
        ) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to revoke this certificate'
            });
        }

        const ledgerEntry = await blockchainService.revokeCertificateOnChain(certificateId);

        res.json({
            success: true,
            message: 'Certificate revoked on blockchain',
            data: {
                certificateId: ledgerEntry.certificateId,
                revoked: ledgerEntry.revoked,
                revocationTxHash: ledgerEntry.revocationTxHash,
                revokedAt: ledgerEntry.revokedAt,
                revocationExplorerUrl: ledgerEntry.revocationExplorerUrl
            }
        });
    } catch (error) {
        console.error('Blockchain revocation error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to revoke certificate on blockchain'
        });
    }
});

/**
 * @route   GET /api/v1/blockchain/info/:certificateId
 * @desc    Get blockchain info for a certificate
 * @access  Public
 */
router.get('/info/:certificateId', async (req, res) => {
    try {
        const { certificateId } = req.params;

        const blockchainInfo = await blockchainService.getBlockchainInfo(certificateId);

        if (!blockchainInfo) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not anchored to blockchain'
            });
        }

        res.json({
            success: true,
            data: blockchainInfo
        });
    } catch (error) {
        console.error('Error fetching blockchain info:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blockchain info'
        });
    }
});

/**
 * @route   GET /api/v1/blockchain/stats
 * @desc    Get blockchain statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await blockchainService.getBlockchainStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching blockchain stats:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch blockchain statistics'
        });
    }
});

/**
 * @route   GET /api/v1/blockchain/transactions
 * @desc    Get recent blockchain transactions
 * @access  Public
 */
router.get('/transactions', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        if (limit > 100) {
            return res.status(400).json({
                success: false,
                message: 'Limit cannot exceed 100'
            });
        }

        const transactions = await blockchainService.getRecentTransactions(limit);

        res.json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch transactions'
        });
    }
});

/**
 * @route   POST /api/v1/blockchain/batch-anchor
 * @desc    Batch anchor multiple certificates
 * @access  Protected (Institution/Admin only)
 */
router.post('/batch-anchor', protect, async (req, res) => {
    try {
        const { certificates } = req.body;

        // Validate input
        if (!Array.isArray(certificates) || certificates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of certificates'
            });
        }

        // Check authorization
        if (req.user.role !== 'institution' && req.user.role !== 'regulatory') {
            return res.status(403).json({
                success: false,
                message: 'Only institutions and regulatory bodies can batch anchor certificates'
            });
        }

        // Verify all certificates exist and user has permission
        for (const cert of certificates) {
            const certificate = await Certificate.findById(cert.certificateId);
            if (!certificate) {
                return res.status(404).json({
                    success: false,
                    message: `Certificate ${cert.certificateId} not found`
                });
            }
            if (
                certificate.issuerId?.toString() !== req.user._id.toString() &&
                req.user.role !== 'regulatory'
            ) {
                return res.status(403).json({
                    success: false,
                    message: `Not authorized to anchor certificate ${cert.certificateId}`
                });
            }
        }

        // Prepare certificates with data
        const certificatesWithData = await Promise.all(
            certificates.map(async (cert) => {
                const certificate = await Certificate.findById(cert.certificateId);
                return {
                    certificateId: cert.certificateId,
                    certificateData: certificate,
                    issuerWallet: cert.issuerWallet
                };
            })
        );

        const results = await blockchainService.batchAnchorCertificates(certificatesWithData);

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        res.status(201).json({
            success: true,
            message: `Batch anchoring completed: ${successCount} succeeded, ${failCount} failed`,
            data: {
                total: results.length,
                succeeded: successCount,
                failed: failCount,
                results
            }
        });
    } catch (error) {
        console.error('Batch anchoring error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to batch anchor certificates'
        });
    }
});

/**
 * @route   GET /api/v1/blockchain/hash/:certificateId
 * @desc    Get certificate hash (for verification)
 * @access  Public
 */
router.get('/hash/:certificateId', async (req, res) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findById(certificateId);
        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        const certificateHash = blockchainService.generateCertificateHash(certificate);

        res.json({
            success: true,
            data: {
                certificateId,
                hash: certificateHash,
                algorithm: 'SHA-256'
            }
        });
    } catch (error) {
        console.error('Error generating certificate hash:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate certificate hash'
        });
    }
});

export default router;
