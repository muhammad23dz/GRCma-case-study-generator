import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';

// GET /api/admin/users - List users
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!['admin', 'manager'].includes(context.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            where: context.role === 'admin' ? {} : { orgId: context.orgId || undefined },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true,
                createdAt: true
            }
        });

        const invitations = await prisma.invitation.findMany({
            where: context.role === 'admin' ? {} : { organizationId: context.orgId || undefined },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ users, invitations });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/admin/users/invite - Invite new user
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!['admin', 'manager'].includes(context.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        console.log('[API] Invite Payload:', body);
        const { email, role } = body;

        // check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            // Check if we can update this user (org scoping)
            if (context.role !== 'admin' && existingUser.orgId !== (context.orgId as string)) {
                return NextResponse.json({ error: 'User belongs to another organization' }, { status: 403 });
            }

            await prisma.user.update({
                where: { email },
                data: { role }
            });
            return NextResponse.json({ message: 'User updated', type: 'update' });
        }

        // Create Invitation
        console.log('[API] Creating Invitation DB Record...');
        const expires = new Date();
        expires.setDate(expires.getDate() + 7); // 7 days

        const invitation = await prisma.invitation.upsert({
            where: { email },
            update: {
                role,
                invitedBy: context.email,
                expires,
                organizationId: context.orgId || undefined
            },
            create: {
                email,
                role,
                invitedBy: context.email,
                expires,
                organizationId: context.orgId || undefined
            }
        });
        console.log('[API] Invitation Upsert Success:', invitation.id);

        // Send Email Notification
        console.log('[API] Attempting to send email...');
        let emailSent = false;
        let emailError = null;
        try {
            const { sendInvitationEmail } = await import('@/lib/email');
            const result = await sendInvitationEmail(email, role, context.email);
            console.log('[API] Email Send Result:', result ? 'Success' : 'Null Response');

            if (result) {
                emailSent = true;
            } else {
                emailError = 'SMTP not configured in System Settings';
            }
        } catch (error: any) {
            console.error('[API] Failed to send invitation email:', error);
            emailError = error.message || 'Unknown email error';
        }

        return NextResponse.json({
            invitation,
            type: 'invite',
            emailSent,
            emailError
        });
    } catch (error: any) {
        console.error('[API] POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
