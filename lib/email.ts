import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function sendInvitationEmail(to: string, role: string, inviterName: string = 'Administrator') {
    // Fetch Settings from DB
    const settings = await prisma.systemSetting.findMany({
        where: {
            key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_SECURE', 'SMTP_FROM', 'NEXTAUTH_URL'] }
        }
    });

    const config = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);

    console.log('DEBUG: Email Config Keys Loaded:', Object.keys(config));

    // Fallback to ENV if not in DB
    const host = config.SMTP_HOST || process.env.SMTP_HOST;
    const user = config.SMTP_USER || process.env.SMTP_USER;
    const pass = config.SMTP_PASS || process.env.SMTP_PASS;
    const port = config.SMTP_PORT || process.env.SMTP_PORT || '587';
    const secure = config.SMTP_SECURE ? config.SMTP_SECURE === 'true' : (process.env.SMTP_SECURE === 'true');
    const from = config.SMTP_FROM || process.env.SMTP_FROM || '"GRCma Platform" <noreply@example.com>';
    const baseUrl = config.NEXTAUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    if (!host || !user) {
        console.warn('SMTP not configured in DB or ENV. Skipping email.');
        return null;
    }

    const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure,
        auth: {
            user,
            pass,
        },
    });

    try {
        const info = await transporter.sendMail({
            from,
            to,
            subject: 'Invitation to join GRCma Platform',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #10b981;">Welcome to GRCma</h2>
                    <p>Hello,</p>
                    <p>You have been invited by <strong>${inviterName}</strong> to join the GRCma Governance Platform.</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Assigned Role:</strong> ${role.toUpperCase()}</p>
                    </div>
                    <p>Please log in using your Google Account to access the platform.</p>
                    <a href="${baseUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Access Platform</a>
                    <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">If you were not expecting this invitation, you can ignore this email.</p>
                </div>
            `,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error: any) {
        console.error('Error sending email:', error);

        let errorMessage = 'Unknown Error';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        } else {
            errorMessage = JSON.stringify(error);
        }

        throw new Error(errorMessage);
    }
}
