import { NextRequest, NextResponse } from 'next/server';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { safeError } from '@/lib/security';

// GET /api/reports - Get user's saved assessment reports
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();

        if (!context || !context.userId) {
            return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
        }

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
        const { message, status, code } = safeError(error, 'Reports GET');
        return NextResponse.json({ error: message, code }, { status });
    }
}

// POST /api/reports - Save a new assessment report
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();

        if (!context || !context.userId) {
            return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
        }

        const body = await request.json();
        const { sections } = body;

        if (!sections) {
            return NextResponse.json({ error: 'Report sections are required.' }, { status: 400 });
        }

        // Use resolved context.userId consistently
        const report = await prisma.report.create({
            data: {
                userId: context.userId,
                sections: sections || {}
            }
        });

        try {
            await logAudit({
                entity: 'Report',
                entityId: report.id,
                action: 'CREATE',
                changes: JSON.stringify({ timestamp: report.timestamp })
            });
        } catch (auditError) {
            console.warn('[Reports POST] Audit log failed:', auditError);
        }

        return NextResponse.json({ report, success: true });
    } catch (error: unknown) {
        const { message, status, code } = safeError(error, 'Reports POST');
        return NextResponse.json({ error: message, code }, { status });
    }
}
