import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/reports - Get user's saved assessment reports
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    console.log('[Reports GET] Starting...');

    try {
        // Step 1: Get authentication using top-level import
        const authResult = await auth();
        const userId = authResult.userId;
        console.log('[Reports GET] Auth result userId:', userId);

        if (!userId) {
            console.log('[Reports GET] No authenticated userId found');
            return NextResponse.json({ reports: [] }); // Return empty instead of error for better UX
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        // Step 2: Find database user
        let dbUserId = userId;
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!dbUser && userEmail) {
            const dbUserByEmail = await prisma.user.findUnique({ where: { email: userEmail } });
            if (dbUserByEmail) {
                dbUserId = dbUserByEmail.id;
            }
        }

        console.log('[Reports GET] Looking for reports with userId:', dbUserId);

        // Step 3: Find reports
        const reports = await prisma.report.findMany({
            where: { userId: dbUserId },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        console.log('[Reports GET] Found', reports.length, 'reports');

        // Parse sections JSON for each report
        const parsedReports = reports.map(report => ({
            ...report,
            sections: typeof report.sections === 'string' ? JSON.parse(report.sections) : report.sections
        }));

        const response = NextResponse.json({ reports: parsedReports });

        // Disable all caching to prevent stale data sync issues
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error: unknown) {
        console.error('[Reports GET] Error:', error);
        return NextResponse.json({ reports: [] });
    }
}

// POST /api/reports - Save a new assessment report
export async function POST(request: NextRequest) {
    console.log('[Reports POST] Starting...');

    try {
        // Step 1: Get authentication EXACTLY like /api/grc/generate which WORKS
        // Auth must be called FIRST before any other async operations
        const { userId } = await auth();
        console.log('[Reports POST] Direct auth userId:', userId);

        if (!userId) {
            console.log('[Reports POST] No userId from auth()');
            return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;
        console.log('[Reports POST] User email:', userEmail);

        if (!userEmail) {
            console.log('[Reports POST] No email found');
            return NextResponse.json({ error: 'User email required' }, { status: 400 });
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

