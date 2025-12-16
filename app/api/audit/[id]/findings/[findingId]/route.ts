import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/audit/[id]/findings/[findingId] - Update finding
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; findingId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { findingId } = await params;
        const body = await request.json();
        const { status, remediationPlan, dueDate } = body;

        const finding = await prisma.auditFinding.update({
            where: { id: findingId },
            data: {
                status,
                remediationPlan,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                updatedAt: new Date()
            },
            include: {
                control: true,
                audit: true
            }
        });

        return NextResponse.json({ finding });
    } catch (error: any) {
        console.error('Error updating finding:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/audit/[id]/findings/[findingId] - Delete finding
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; findingId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { findingId } = await params;

        await prisma.auditFinding.delete({
            where: { id: findingId }
        });

        return NextResponse.json({ message: 'Finding deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting finding:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
