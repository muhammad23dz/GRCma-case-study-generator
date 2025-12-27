import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

// Check if we have a valid DATABASE_URL
const hasValidDb = process.env.DATABASE_URL?.startsWith('postgres');

// GET /api/reports - Get user's saved assessment reports
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ reports: [] });

        if (!hasValidDb) {
            console.warn('[Reports GET] No valid DATABASE_URL, returning demo reports');
            return NextResponse.json({
                reports: [{
                    id: 'demo-report-1',
                    userId: userId,
                    timestamp: new Date().toISOString(),
                    sections: {
                        executiveSummary: { problemStatement: 'Demo Report (No Database Connected)' },
                        controls: [{ title: 'Access Control', description: 'Sample Control', controlType: 'preventive' }],
                        risks: [{ narrative: 'Sample Risk', likelihood: 3, impact: 3, category: 'General' }]
                    }
                }]
            });
        }

        const { prisma } = await import('@/lib/prisma');
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        // Find database user
        let dbUserId = userId;
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });

        if (!dbUser && userEmail) {
            const dbUserByEmail = await prisma.user.findUnique({ where: { email: userEmail } });
            if (dbUserByEmail) dbUserId = dbUserByEmail.id;
        }

        // Find reports
        const reports = await prisma.report.findMany({
            where: { userId: dbUserId },
            orderBy: { timestamp: 'desc' },
            take: 50
        });

        // Parse sections JSON for each report
        const parsedReports = reports.map(report => ({
            ...report,
            sections: typeof report.sections === 'string' ? JSON.parse(report.sections) : report.sections
        }));

        const response = NextResponse.json({ reports: parsedReports });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return response;
    } catch (error: unknown) {
        console.error('[Reports GET] Error:', error);
        return NextResponse.json({ reports: [] });
    }
}

// POST /api/reports - Save a new assessment report
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!hasValidDb) {
            console.warn('[Reports POST] No valid DATABASE_URL, returning success in demo mode');
            const body = await request.json();
            return NextResponse.json({
                report: { id: 'demo-' + Date.now(), userId, sections: body.sections, timestamp: new Date().toISOString() },
                success: true
            });
        }

        const { prisma } = await import('@/lib/prisma');
        const { logAudit } = await import('@/lib/audit-log');
        const { safeError } = await import('@/lib/security');

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        // Find or create database user
        let dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!dbUser && userEmail) dbUser = await prisma.user.findUnique({ where: { email: userEmail } });

        if (!dbUser && userEmail) {
            dbUser = await prisma.user.create({
                data: { id: userId, email: userEmail, name: userEmail.split('@')[0] || 'User', role: 'user' }
            });
        }

        if (!dbUser) return NextResponse.json({ error: 'Could not resolve user' }, { status: 401 });

        const body = await request.json();
        const { sections } = body;

        const report = await prisma.report.create({
            data: { userId: dbUser.id, sections: sections || {} }
        });

        try {
            await logAudit({ entity: 'Report', entityId: report.id, action: 'CREATE', changes: { timestamp: report.timestamp } });
        } catch (auditError) { }

        return NextResponse.json({ report, success: true });
    } catch (error: unknown) {
        console.error('[Reports POST] Error:', error);
        const { safeError } = await import('@/lib/security');
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

