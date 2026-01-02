import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function DELETE(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const isolationFilter = getIsolationFilter(context, 'Action');

        // Verify ownership/isolation
        const action = await prisma.action.findFirst({
            where: { id, ...isolationFilter },
            select: { id: true, owner: true }
        });

        if (!action) {
            return NextResponse.json({ error: 'Action not found or access denied' }, { status: 404 });
        }

        // Check permissions if not owner
        if (action.owner && action.owner !== context.email && context.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.action.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting action:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
