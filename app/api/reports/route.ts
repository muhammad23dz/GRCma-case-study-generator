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
        // Step 1: Try cookie-based auth first
        let userId: string | null = null;
        let userEmail: string = '';

        const authResult = await auth();
        userId = authResult.userId;
        console.log('[Reports POST] Cookie auth userId:', userId);

        // Step 2: If cookie auth fails, try Bearer token from Authorization header
        if (!userId) {
            const authHeader = request.headers.get('Authorization');
            if (authHeader?.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                console.log('[Reports POST] Trying Bearer token verification...');
                try {
                    // Verify the Clerk session token
                    const { verifyToken } = await import('@clerk/backend');
                    const verified = await verifyToken(token, {
                        secretKey: process.env.CLERK_SECRET_KEY!
                    });
                    if (verified?.sub) {
                        userId = verified.sub;
                        console.log('[Reports POST] Bearer token verified - userId:', userId);
                    }
                } catch (tokenError: any) {
                    console.error('[Reports POST] Token verification error:', tokenError.message);
                }
            }
        }

        if (!userId) {
            console.log('[Reports POST] All auth methods failed');
            return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
        }

        // Get user email - try currentUser first, then DB lookup
        const user = await currentUser();
        userEmail = user?.primaryEmailAddress?.emailAddress || '';

        if (!userEmail) {
            // Fallback: get email from DB user
            const dbUserForEmail = await prisma.user.findUnique({ where: { id: userId } });
            userEmail = dbUserForEmail?.email || '';
        }

        console.log('[Reports POST] User email:', userEmail);

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
                sections: sections || {}
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

