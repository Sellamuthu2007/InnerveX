import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Create transporter
const createTransporter = () => {
    // For development, use ethereal email or log to console
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        return null; // Will log to console instead
    }

    const port = parseInt(process.env.SMTP_PORT) || 587;
    
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465, // true for 465, false for other ports (587)
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false // Accept self-signed certificates
        },
        debug: true, // Enable debug output
        logger: true // Log to console
    });
};

const transporter = createTransporter();

// Send email utility
export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        // If no transporter, log to console (development mode)
        if (!transporter) {
            console.log('\n================================');
            console.log('[EMAIL SIMULATION]');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${text || html}`);
            console.log('================================\n');
            return { success: true, messageId: 'simulated' };
        }

        console.log(`\n[EMAIL] Attempting to send email to: ${to}`);
        console.log(`[EMAIL] Subject: ${subject}`);
        console.log(`[EMAIL] From: ${process.env.SMTP_USER}`);

        const info = await transporter.sendMail({
            from: `"InnerveX DigiBank" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log(`[EMAIL] ✓ Email sent successfully. Message ID: ${info.messageId}`);
        logger.info('Email sent successfully', { to, subject, messageId: info.messageId });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[EMAIL] ✗ Email sending failed:`, error.message);
        console.error(`[EMAIL] Error code:`, error.code);
        console.error(`[EMAIL] Full error:`, error);
        logger.error('Email sending failed', error, { to, subject });
        return { success: false, error: error.message };
    }
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
    const subject = 'Your InnerveX Verification Code';
    const text = `Your OTP is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">InnerveX DigiBank</h2>
            <p>Your verification code is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
                ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>
            <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
    `;

    return await sendEmail({ to: email, subject, text, html });
};

// Send certificate issued notification
export const sendCertificateIssuedEmail = async (email, certificateTitle, issuerName) => {
    const subject = 'New Certificate Issued';
    const text = `A new certificate "${certificateTitle}" has been issued to you by ${issuerName}.\n\nLogin to your InnerveX wallet to view it.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎓 New Certificate Issued</h2>
            <p>Congratulations! A new certificate has been issued to you.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Certificate:</strong> ${certificateTitle}</p>
                <p style="margin: 10px 0 0 0;"><strong>Issued by:</strong> ${issuerName}</p>
            </div>
            <p>Login to your InnerveX wallet to view and manage your certificate.</p>
        </div>
    `;

    return await sendEmail({ to: email, subject, text, html });
};

// Send certificate revoked notification
export const sendCertificateRevokedEmail = async (email, certificateTitle, issuerName, reason) => {
    const subject = 'Important: Certificate Revoked';
    const text = `Your certificate "${certificateTitle}" issued by ${issuerName} has been revoked.\n\n${reason ? `Reason: ${reason}` : ''}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">⚠️ Certificate Revoked</h2>
            <p>Your certificate has been permanently revoked.</p>
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
                <p style="margin: 0;"><strong>Certificate:</strong> ${certificateTitle}</p>
                <p style="margin: 10px 0 0 0;"><strong>Issued by:</strong> ${issuerName}</p>
                ${reason ? `<p style="margin: 10px 0 0 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
            </div>
            <p style="color: #6b7280; font-size: 14px;">If you believe this is an error, please contact the issuing institution.</p>
        </div>
    `;

    return await sendEmail({ to: email, subject, text, html });
};

// Send certificate shared notification
export const sendCertificateSharedEmail = async (email, certificateTitle, sharedBy) => {
    const subject = 'Certificate Shared With You';
    const text = `${sharedBy} has shared a certificate "${certificateTitle}" with you.\n\nLogin to InnerveX to view it.`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">📄 Certificate Shared</h2>
            <p>${sharedBy} has shared a certificate with you.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Certificate:</strong> ${certificateTitle}</p>
                <p style="margin: 10px 0 0 0;"><strong>Shared by:</strong> ${sharedBy}</p>
            </div>
            <p>Login to InnerveX to view the certificate details.</p>
        </div>
    `;

    return await sendEmail({ to: email, subject, text, html });
};
