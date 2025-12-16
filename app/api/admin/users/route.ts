import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users - List users
export async function GET(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Verify Admin Role
        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true, role: true, name: true } });
        const userRole = dbUser?.role || 'user';
        const userEmail = dbUser?.email || '';
        const userName = dbUser?.name || 'Administrator';

        if (userRole !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Multi-Tenant Scope
        if (!orgId) {
            // Return empty if no org
        }

        const users = await prisma.user.findMany({
            where: {
                orgId: orgId || undefined
            },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                image: true
            }
        });

        const orgUserEmails = users.map(u => u.email).filter(e => e !== null) as string[];

        const invitations = await prisma.invitation.findMany({
            where: {
                invitedBy: { in: orgUserEmails.length > 0 ? orgUserEmails : [userEmail] }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ users, invitations });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/admin/users/invite - Invite new user
export async function POST(request: NextRequest) {
    console.log('[API] POST /api/admin/users - Start');
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true, role: true, name: true } });
        if (dbUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const userEmail = dbUser?.email || '';
        const userName = dbUser?.name || 'Administrator';

        const body = await request.json();
        console.log('[API] Invite Payload:', body);
        const { email, role } = body;

        // check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log('[API] User exists, updating role');
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
            update: { role, invitedBy: userEmail, expires },
            create: {
                email,
                role,
                invitedBy: userEmail,
                expires
            }
        });
        console.log('[API] Invitation Upsert Success:', invitation.id);

        // Send Email Notification
        console.log('[API] Attempting to send email...');
        let emailSent = false;
        let emailError = null;
        try {
            const { sendInvitationEmail } = await import('@/lib/email');
            const result = await sendInvitationEmail(email, role, userName);
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
