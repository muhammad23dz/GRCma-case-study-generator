import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';
        const role = user?.publicMetadata?.role as string || 'user';

        const { id } = await params;
        const body = await request.json();
        const { status, reviewNotes } = body;

        // Verify permissions for approval
        const { canApprove } = await import('@/lib/permissions');

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
                reviewer: status !== 'draft' ? userEmail : undefined,
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
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const role = user?.publicMetadata?.role as string || 'user';

        // Enforce RBAC for Deletion
        const { canDeleteRecords } = await import('@/lib/permissions');

        if (!canDeleteRecords(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Admins can delete evidence' }, { status: 403 });
        }

        const { id } = await context.params;

        await prisma.evidence.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting evidence:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
