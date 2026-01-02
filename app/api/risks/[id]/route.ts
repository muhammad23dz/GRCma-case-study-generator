import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { safeError } from '@/lib/security';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';

export async function DELETE(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const role = user?.publicMetadata?.role as string || 'user';

        const { id } = await routeContext.params;
        const isolationFilter = getIsolationFilter(context, 'Risk');

        const risk = await prisma.risk.findFirst({
            where: { id, ...isolationFilter },
            select: { id: true, owner: true }
        });

        if (!risk) {
            return NextResponse.json({ error: 'Risk not found or access denied' }, { status: 404 });
        }

        // Strict ownership check (Admin/Manager can bypass)
        if (risk.owner && risk.owner !== context.email) {
            const { canDeleteRecords } = await import('@/lib/permissions');
            if (!canDeleteRecords(role)) {
                return NextResponse.json({ error: 'Forbidden: Insufficient Privileges to Delete Risk' }, { status: 403 });
            }
        }

        await prisma.risk.delete({ where: { id } });

        await logAudit({
            entity: 'Risk',
            entityId: id,
            action: 'DELETE',
            changes: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting risk:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
