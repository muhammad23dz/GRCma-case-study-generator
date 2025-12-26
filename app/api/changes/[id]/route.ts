import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

// GET /api/changes/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const change = await prisma.change.findUnique({
            where: { id },
            include: {
                approvals: true,
                tasks: true,
                risks: { include: { risk: true } },
                impacts: true,
                comments: { orderBy: { createdAt: 'desc' } },
                attachments: true,
            }
        });

        if (!change) {
            return NextResponse.json({ error: 'Change not found' }, { status: 404 });
        }

        return NextResponse.json({ change });
    } catch (error: unknown) {
        console.error('Error fetching change:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// DELETE /api/changes/[id]
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

        const { id } = await context.params;

        const change = await prisma.change.findUnique({
            where: { id },
            select: { requestedBy: true }
        });

        if (!change) {
            return NextResponse.json({ error: 'Change not found' }, { status: 404 });
        }

        const { canDeleteRecords } = await import('@/lib/permissions');

        // RBAC: Strict Admin Only for Hard Deletion
        if (!canDeleteRecords(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Admins can delete changes' }, { status: 403 });
        }

        // Use transaction to ensure clean delete of all related records
        await prisma.$transaction(async (tx) => {
            // 1. Delete all dependencies explicitly to prevent constraint errors
            await tx.changeApproval.deleteMany({ where: { changeId: id } });
            await tx.changeTask.deleteMany({ where: { changeId: id } });
            await tx.changeRisk.deleteMany({ where: { changeId: id } });
            await tx.changeImpact.deleteMany({ where: { changeId: id } });
            await tx.changeComment.deleteMany({ where: { changeId: id } });
            await tx.changeAttachment.deleteMany({ where: { changeId: id } });

            // 2. Delete the Change
            await tx.change.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting change:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
