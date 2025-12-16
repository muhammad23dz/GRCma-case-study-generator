
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { status, reviewNotes } = body;

        // Verify permissions
        const role = (session.user as any).role;
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
                reviewer: status !== 'draft' ? session.user.email : undefined,
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
    } catch (error: any) {
        console.error('Error updating evidence:', error);
        return NextResponse.json({ error: error?.message || 'Unknown server error' }, { status: 500 });
    }
}

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

        // Enforce RBAC for Deletion
        const role = (session.user as any).role;
        const { canDeleteRecords } = await import('@/lib/permissions');

        if (!canDeleteRecords(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Admins can delete evidence' }, { status: 403 });
        }

        await prisma.evidence.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting evidence:', error);
        const errorMessage = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Unknown server error during deletion';
        console.error('Constructed error message:', errorMessage); // Debug log
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
