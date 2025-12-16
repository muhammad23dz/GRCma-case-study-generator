import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth'; // Keep this import for now, though it might become unused if authOptions are only for next-auth

// GET /api/changes/[id]
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = params;

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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/changes/[id]
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        const change = await prisma.change.findUnique({
            where: { id },
            select: { requestedBy: true }
        });

        if (!change) {
            return NextResponse.json({ error: 'Change not found' }, { status: 404 });
        }

        const role = (session.user as any).role;
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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
