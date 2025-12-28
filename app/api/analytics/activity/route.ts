import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/analytics/activity - Get recent audit activity for the organization
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const logs = await prisma.auditLog.findMany({
            where: {
                organizationId: context.orgId
            },
            take: 20,
            orderBy: { timestamp: 'desc' },
            select: {
                id: true,
                userName: true,
                userEmail: true,
                action: true,
                resource: true,
                resourceId: true,
                timestamp: true,
                changes: true
            }
        });

        return NextResponse.json({ activity: logs });
    } catch (error: any) {
        const { message, status, code } = safeError(error, 'Activity Analytics');
        return NextResponse.json({ error: message, code }, { status });
    }
}
