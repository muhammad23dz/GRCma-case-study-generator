import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Only Admin/Manager can view audit logs
        if (!['admin', 'manager'].includes(context.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const logs = await prisma.auditLog.findMany({
            where: context.role === 'admin' ? {} : { organizationId: context.orgId },
            orderBy: { timestamp: 'desc' },
            take: 100 // Limit to latest 100
        });

        return NextResponse.json(logs);
    } catch (error: unknown) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
