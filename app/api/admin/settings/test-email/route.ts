import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true, role: true } });
        if (dbUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const userEmail = dbUser?.email || '';
        const { email } = await request.json();

        const { sendInvitationEmail } = await import('@/lib/email');

        const result = await sendInvitationEmail(
            userEmail,
            'TEST_VERIFICATION',
            'GRCma System'
        );

        if (!result) {
            throw new Error('SMTP Configuration Missing or Invalid');
        }

        return NextResponse.json({ success: true, messageId: result.messageId });

    } catch (error: any) {
        console.error('Test Email Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
