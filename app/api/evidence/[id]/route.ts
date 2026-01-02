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
        const { status, reviewNotes } = body;
        const isolationFilter = getIsolationFilter(context, 'Evidence');

        // Verify existence/ownership
        const existing = await prisma.evidence.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Evidence not found or access denied' }, { status: 404 });
        }

        // Verify permissions for approval
        const { canApprove } = await import('@/lib/permissions');
        const role = context.role;

        if (status === 'approved' || status === 'rejected') {
            if (!canApprove(role)) {
                return NextResponse.json({ error: 'Forbidden: Only Managers/Admins can approve evidence' }, { status: 403 });
            }
        }

        const evidence = await prisma.evidence.update({
            where: { id },
            data: {
                status,
                reviewNotes,
                reviewer: status !== 'draft' ? context.email : undefined,
                reviewedAt: status !== 'draft' ? new Date() : undefined,
            },
            include: {
                control: true,
                risk: true,
                requirement: {
                    include: { framework: true }
                }
            }
        });

        return NextResponse.json({ evidence });
    } catch (error: unknown) {
        console.error('Error updating evidence:', error);
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
        const isolationFilter = getIsolationFilter(context, 'Evidence');

        // Verify existence/ownership
        const existing = await prisma.evidence.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Evidence not found or access denied' }, { status: 404 });
        }

        const { role } = context;
        const { canDeleteRecords } = await import('@/lib/permissions');

        if (!canDeleteRecords(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Admins can delete evidence' }, { status: 403 });
        }

        await prisma.evidence.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting evidence:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
