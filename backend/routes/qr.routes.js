import express from 'express';
import QRCode from 'qrcode';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * @route   GET /api/v1/qr/generate
 * @desc    Generate QR code for any URL or data
 * @access  Public
 */
router.get('/generate', asyncHandler(async (req, res) => {
    const { data, size = 300, format = 'png' } = req.query;

    if (!data) {
        return res.status(400).json({ message: 'Data parameter is required' });
    }

    try {
        // QR Code options
        const options = {
            width: parseInt(size),
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: 'H' // High error correction
        };

        if (format === 'svg') {
            // Generate SVG
            const svg = await QRCode.toString(data, { ...options, type: 'svg' });
            res.setHeader('Content-Type', 'image/svg+xml');
            res.send(svg);
        } else {
            // Generate PNG (default)
            const buffer = await QRCode.toBuffer(data, options);
            res.setHeader('Content-Type', 'image/png');
            res.send(buffer);
        }
    } catch (error) {
        console.error('QR Code generation error:', error);
        res.status(500).json({ message: 'Failed to generate QR code' });
    }
}));

/**
 * @route   POST /api/v1/qr/batch
 * @desc    Generate multiple QR codes at once
 * @access  Public
 */
router.post('/batch', asyncHandler(async (req, res) => {
    const { items, size = 300 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Items array is required' });
    }

    if (items.length > 50) {
        return res.status(400).json({ message: 'Maximum 50 QR codes per batch' });
    }

    try {
        const options = {
            width: parseInt(size),
            margin: 2,
            errorCorrectionLevel: 'H'
        };

        const qrCodes = await Promise.all(
            items.map(async (item) => {
                const dataUrl = await QRCode.toDataURL(item.data, options);
                return {
                    id: item.id || item.data,
                    dataUrl
                };
            })
        );

        res.json({ qrCodes });
    } catch (error) {
        console.error('Batch QR Code generation error:', error);
        res.status(500).json({ message: 'Failed to generate QR codes' });
    }
}));

export default router;
