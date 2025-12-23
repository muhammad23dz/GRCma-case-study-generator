import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const { id } = await context.params;

        const risk = await prisma.risk.findUnique({
            where: { id },
            select: { owner: true }
        });

        if (!risk) {
            return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
        }

        // Strict ownership check
        if (risk.owner && risk.owner !== userEmail) {
            // Check permissions
            const role = user?.publicMetadata?.role as string || 'user';
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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
