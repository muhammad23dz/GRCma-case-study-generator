import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

// Check if we have a valid DATABASE_URL
const hasValidDb = process.env.DATABASE_URL?.startsWith('postgres');

// GET /api/reports - Get user's saved assessment reports
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { getIsolationContext, getIsolationFilter } = await import('@/lib/isolation');
        const context = await getIsolationContext();

        if (!context) return NextResponse.json({ reports: [] });

        if (!hasValidDb) {
            console.warn('[Reports GET] No valid DATABASE_URL, returning demo reports');
            return NextResponse.json({
                reports: [{
                    id: 'demo-report-1',
                    userId: context.userId,
                    timestamp: new Date().toISOString(),
                    sections: {
                        executiveSummary: { problemStatement: 'Expert Demo Report (No Database Connected)' },
                        controls: [{ title: 'Access Control', description: 'Sample Control', controlType: 'preventive' }],
                        risks: [{ narrative: 'Sample Risk', likelihood: 3, impact: 3, category: 'General' }]
                    }
                }]
            });
        }

        const { prisma } = await import('@/lib/prisma');

        // Use standard isolation filter
        const filter = getIsolationFilter(context, 'Report');

        const reports = await prisma.report.findMany({
            where: filter,
            orderBy: { timestamp: 'desc' },
            take: 50
        });

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
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();

        if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!hasValidDb) {
            const body = await request.json();
            return NextResponse.json({
                report: { id: 'demo-' + Date.now(), userId: context.userId, sections: body.sections, timestamp: new Date().toISOString() },
                success: true
            });
        }

        const { prisma } = await import('@/lib/prisma');
        const { logAudit } = await import('@/lib/audit-log');
        const { safeError } = await import('@/lib/security');

        const body = await request.json();
        const { sections } = body;

        // Use resolved context.userId consistently
        const report = await prisma.report.create({
            data: { userId: context.userId, sections: sections || {} }
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

