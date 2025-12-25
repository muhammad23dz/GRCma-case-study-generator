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
    console.log('[Reports POST] Starting...');

    try {
        // Step 1: Try to get authentication context
        let userId: string | null = null;
        let userEmail = '';

        try {
            // Import auth at top level to avoid dynamic import issues
            const { auth, currentUser } = await import('@clerk/nextjs/server');
            const authResult = await auth();
            userId = authResult.userId;
            console.log('[Reports POST] Auth result userId:', userId);

            if (userId) {
                const user = await currentUser();
                userEmail = user?.primaryEmailAddress?.emailAddress || '';
                console.log('[Reports POST] User email:', userEmail);
            }
        } catch (authError: any) {
            console.error('[Reports POST] Auth error:', authError.message);
        }

        if (!userId) {
            console.log('[Reports POST] No authenticated userId found');
            return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
        }

        // Step 2: Find or create database user
        let dbUser = await prisma.user.findUnique({ where: { id: userId } });
        console.log('[Reports POST] DB user by ID:', dbUser?.id);

        if (!dbUser && userEmail) {
            dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
            console.log('[Reports POST] DB user by email:', dbUser?.id);
        }

        if (!dbUser && userEmail) {
            console.log('[Reports POST] Creating new user:', userEmail);
            try {
                dbUser = await prisma.user.create({
                    data: {
                        id: userId,
                        email: userEmail,
                        name: userEmail.split('@')[0] || 'User',
                        role: 'user'
                    }
                });
                console.log('[Reports POST] Created user:', dbUser.id);
            } catch (createError: any) {
                console.error('[Reports POST] User creation error:', createError.message);
                // Try to find user again in case of race condition
                dbUser = await prisma.user.findUnique({ where: { id: userId } });
            }
        }

        if (!dbUser) {
            console.log('[Reports POST] Could not resolve or create user');
            return NextResponse.json({ error: 'Could not resolve user account' }, { status: 401 });
        }

        // Step 3: Parse request body
        const body = await request.json();
        const { sections } = body;
        console.log('[Reports POST] Sections received:', !!sections);

        // Step 4: Create report
        const report = await prisma.report.create({
            data: {
                userId: dbUser.id,
                sections: JSON.stringify(sections)
            }
        });
        console.log('[Reports POST] Report created:', report.id);

        // Step 5: Audit log (non-blocking)
        try {
            await logAudit({
                entity: 'Report',
                entityId: report.id,
                action: 'CREATE',
                changes: { timestamp: report.timestamp }
            });
        } catch (auditError) {
            console.error('[Reports POST] Audit log error (non-fatal):', auditError);
        }

        return NextResponse.json({ report, success: true });
    } catch (error: unknown) {
        console.error('[Reports POST] Unexpected Error:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

