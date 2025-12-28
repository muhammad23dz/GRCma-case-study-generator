import { NextRequest, NextResponse } from 'next/server';

// Check if we have a valid DATABASE_URL
const hasValidDb = process.env.DATABASE_URL?.startsWith('postgres');

// DELETE /api/reports/[id] - Delete a specific report
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();

        if (!hasValidDb || !context) {
            return NextResponse.json({ error: 'Infrastructure Missing' }, { status: 503 });
        }

        const { id } = await params;

        const { prisma } = await import('@/lib/prisma');
        const { logAudit } = await import('@/lib/audit-log');
        const { safeError } = await import('@/lib/security');

        // Verify ownership using context.userId (consistently resolved)
        const report = await prisma.report.findFirst({
            where: { id, userId: context.userId }
        });

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        await prisma.report.delete({
            where: { id }
        });

        // Audit the deletion
        await logAudit({
            entity: 'Report',
            entityId: id,
            action: 'DELETE',
            changes: { timestamp: report.timestamp, id }
        }).catch(() => { });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting report:', error);
        const { safeError } = await import('@/lib/security');
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// GET /api/reports/[id] - Get a specific report
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();

        if (!hasValidDb || !context) {
            return NextResponse.json({ error: 'Infrastructure Missing' }, { status: 503 });
        }

        const { id } = await params;

        const { prisma } = await import('@/lib/prisma');
        const { safeError } = await import('@/lib/security');

        const report = await prisma.report.findFirst({
            where: { id, userId: context.userId }
        });

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        const response = NextResponse.json({
            report: {
                ...report,
                sections: typeof report.sections === 'string' ? JSON.parse(report.sections) : report.sections
            }
        });

        // Disable all caching
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return response;
    } catch (error: unknown) {
        console.error('Error fetching report:', error);
        const { safeError } = await import('@/lib/security');
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
