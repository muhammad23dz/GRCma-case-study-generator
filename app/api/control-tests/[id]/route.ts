import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';

export async function PUT(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const body = await request.json();
        const { result, notes, evidenceId } = body;

        // Verify isolation via parent Control
        const existing = await prisma.controlTest.findFirst({
            where: {
                id,
                control: getIsolationFilter(context, 'Control')
            }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Control Test not found or access denied' }, { status: 404 });
        }

        const controlTest = await prisma.controlTest.update({
            where: { id },
            data: {
                result,
                notes,
                evidenceId
            }
        });

        return NextResponse.json({ test: controlTest });
    } catch (error: unknown) {
        console.error('Error updating control test:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

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

        // Verify isolation via parent Control
        const existing = await prisma.controlTest.findFirst({
            where: {
                id,
                control: getIsolationFilter(context, 'Control')
            }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Control Test not found or access denied' }, { status: 404 });
        }

        const { role } = context;

        // Only managers/admins/analysts can delete
        if (role === 'user' || role === 'viewer') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.controlTest.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting control test:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
