import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Transporter will be created lazily when first needed
let transporter = null;

// Create transporter
const createTransporter = () => {
    console.log('\n========== EMAIL CONFIGURATION DEBUG ==========');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
    console.log('===============================================\n');

    // For development, use ethereal email or log to console
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
        console.log('[EMAIL] No SMTP_HOST configured, will simulate emails');
        return null; // Will log to console instead
    }

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('[EMAIL] ERROR: Missing SMTP configuration!');
        return null;
    }

    const port = parseInt(process.env.SMTP_PORT) || 587;
    
    const config = {
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
    };
    
    console.log('[EMAIL] Creating transporter with host:', config.host, 'port:', config.port);
    return nodemailer.createTransport(config);
};

// Get or create transporter (lazy initialization)
const getTransporter = () => {
    if (!transporter) {
        transporter = createTransporter();
    }
    return transporter;
};

// Send email utility
export const sendEmail = async ({ to, subject, text, html }) => {
    try {
        // Get transporter (lazy initialization ensures env vars are loaded)
        const transporter = getTransporter();

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
export const sendCertificateSharedEmail = async (email, certificateTitle, sharedBy, shareToken, expiresAt = null) => {
    const viewUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared-view/${shareToken}`;
    const subject = 'Certificate Shared With You - InnerveX';
    const text = `${sharedBy} has shared a verified certificate "${certificateTitle}" with you.\n\nView securely at: ${viewUrl}\n\n${expiresAt ? `This link expires on ${new Date(expiresAt).toLocaleDateString()}` : 'This link does not expire.'}`;
    
    const expiryText = expiresAt 
        ? `<p style="margin: 10px 0 0 0; color: #ef4444; font-size: 14px;">
             ⏱️ <strong>Expires:</strong> ${new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
           </p>`
        : '';
    
    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎓 Certificate Shared</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Secure Blockchain-Verified Credential</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px;">
                <p style="font-size: 16px; color: #374151; margin: 0 0 25px 0; line-height: 1.6;">
                    <strong style="color: #111827;">${sharedBy}</strong> has shared a verified certificate with you through InnerveX DigiBank.
                </p>
                
                <!-- Certificate Info Card -->
                <div style="background: #f9fafb; padding: 25px; border-radius: 12px; border-left: 4px solid #2563eb; margin: 25px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <p style="margin: 0; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Certificate Details</p>
                    <h2 style="margin: 10px 0 15px 0; color: #111827; font-size: 22px; font-weight: 600; line-height: 1.3;">${certificateTitle}</h2>
                    <div style="border-top: 1px solid #e5e7eb; margin: 15px 0; padding-top: 15px;">
                        <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.8;">
                            <strong style="color: #374151;">Shared by:</strong> ${sharedBy}
                        </p>
                        ${expiryText}
                    </div>
                </div>
                
                <!-- Call to Action -->
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${viewUrl}" 
                       style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); 
                              color: white; padding: 16px 48px; border-radius: 10px; text-decoration: none; 
                              font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
                              transition: transform 0.2s;">
                        📄 View Certificate Securely
                    </a>
                    <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 12px;">
                        This link is secure and unique to you
                    </p>
                </div>
                
                <!-- Security Notice -->
                <div style="background: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b; margin: 30px 0;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                        🔒 <strong>Security Notice:</strong> This is a secure, unique link protected by blockchain technology. 
                        Keep this link confidential and do not forward it to others.
                    </p>
                </div>
                
                <!-- Features List -->
                <div style="background: #f3f4f6; padding: 25px; border-radius: 10px; margin: 25px 0;">
                    <p style="margin: 0 0 15px 0; color: #374151; font-weight: 600; font-size: 14px;">✨ What you can do:</p>
                    <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 2;">
                        <li>View complete certificate details</li>
                        <li>Verify blockchain authenticity</li>
                        <li>Download digital copy</li>
                        <li>Share via QR code</li>
                    </ul>
                </div>
                
                <!-- Alternative Link -->
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <p style="font-size: 12px; color: #6b7280; margin: 0 0 10px 0;">
                        <strong>Can't click the button?</strong> Copy and paste this link:
                    </p>
                    <a href="${viewUrl}" style="color: #2563eb; word-break: break-all; font-size: 12px; text-decoration: underline;">${viewUrl}</a>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">
                    InnerveX DigiBank
                </p>
                <p style="color: #9ca3af; font-size: 12px; margin: 0 0 15px 0;">
                    Blockchain-Verified Digital Certificates Platform
                </p>
                <div style="margin: 15px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 10px;">Visit Platform</a>
                    <span style="color: #d1d5db;">•</span>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/help" style="color: #2563eb; text-decoration: none; font-size: 12px; margin: 0 10px;">Help Center</a>
                </div>
                <p style="color: #9ca3af; font-size: 11px; margin: 15px 0 0 0; line-height: 1.6;">
                    This is an automated message. If you did not expect this email, please ignore it.<br/>
                    © ${new Date().getFullYear()} InnerveX DigiBank. All rights reserved.
                </p>
            </div>
        </div>
    `;
    
    return await sendEmail({ to: email, subject, text, html });
};
