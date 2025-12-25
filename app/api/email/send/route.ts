import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { recipient, subject, htmlContent, attachments } = await request.json();

        if (!recipient || !htmlContent) {
            return NextResponse.json({ error: "Missing recipient or content" }, { status: 400 });
        }

        // 1. Fetch Global SMTP Settings from SystemSetting table
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_SECURE', 'SMTP_FROM'] }
            }
        });
        const smtpConfig = settings.reduce((acc: any, curr) => ({ ...acc, [curr.key]: curr.value }), {});

        // Configure Transporter with saved SMTP settings
        const hasCreds = smtpConfig.SMTP_HOST && smtpConfig.SMTP_USER;

        if (!hasCreds) {
            console.log("-----------------------------------------");
            console.log("⚠️  MOCK EMAIL SENT (No User SMTP Config) ⚠️");
            console.log(`To: ${recipient}`);
            console.log(`Subject: ${subject}`);
            console.log(`Attachments: ${attachments?.length || 0}`);
            console.log("-----------------------------------------");

            return NextResponse.json({
                success: true,
                mock: true,
                message: "Email simulated. Please configure SMTP in Admin > Settings."
            });
        }

        const transporter = nodemailer.createTransport({
            host: smtpConfig.SMTP_HOST,
            port: Number(smtpConfig.SMTP_PORT) || 587,
            secure: String(smtpConfig.SMTP_SECURE) === 'true',
            auth: {
                user: smtpConfig.SMTP_USER,
                pass: smtpConfig.SMTP_PASS,
            },
        });

        // Send Email with Attachments
        await transporter.sendMail({
            from: smtpConfig.SMTP_FROM || `GRCma Platform <${smtpConfig.SMTP_USER}>`,
            to: recipient,
            subject: subject || "Your GRCma Security Report",
            html: htmlContent,
            attachments: attachments || []
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Email Error:", error);
        return NextResponse.json({ error: "Failed to send email", details: error.message }, { status: 500 });
    }
}
