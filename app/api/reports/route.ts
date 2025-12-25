import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/reports - Get user's saved assessment reports
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find reports by correct DB user ID using isolation utility
        const reports = await prisma.report.findMany({
            where: getIsolationFilter(context, 'Report'),
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        const response = NextResponse.json({ reports });

        // Disable all caching to prevent stale data sync issues
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error: unknown) {
        console.error('[Reports] GET Error:', error);
        return NextResponse.json({ reports: [] });
    }
}

// POST /api/reports - Save a new assessment report
export async function POST(request: NextRequest) {
    try {
        // Try getIsolationContext first
        let context = await getIsolationContext();

        // Fallback: If context is null, try direct auth
        if (!context) {
            console.log('[Reports POST] getIsolationContext returned null, trying direct auth...');
            const { auth, currentUser } = await import('@clerk/nextjs/server');
            const { userId } = await auth();

            if (!userId) {
                console.log('[Reports POST] No userId from direct auth either');
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const user = await currentUser();
            const email = user?.primaryEmailAddress?.emailAddress || '';

            // Find or create user
            let dbUser = await prisma.user.findUnique({ where: { id: userId } });
            if (!dbUser && email) {
                dbUser = await prisma.user.findUnique({ where: { email } });
            }
            if (!dbUser && email) {
                console.log('[Reports POST] Auto-provisioning user:', email);
                dbUser = await prisma.user.create({
                    data: {
                        id: userId,
                        email,
                        name: user?.fullName || 'User',
                        role: 'user'
                    }
                });
            }

            if (!dbUser) {
                return NextResponse.json({ error: 'Could not resolve user' }, { status: 401 });
            }

            context = {
                userId: dbUser.id,
                clerkId: userId,
                email: dbUser.email || email,
                orgId: dbUser.orgId,
                role: dbUser.role || 'user',
                securitySettings: undefined
            };
        }

        const body = await request.json();
        const { sections } = body;

        // Create report linked to resolved DB User ID
        const report = await prisma.report.create({
            data: {
                userId: context!.userId,
                sections: JSON.stringify(sections)
            }
        });

        await logAudit({
            entity: 'Report',
            entityId: report.id,
            action: 'CREATE',
            changes: { timestamp: report.timestamp }
        });

        return NextResponse.json({ report, success: true });
    } catch (error: unknown) {
        console.error('[Reports] POST Error:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
