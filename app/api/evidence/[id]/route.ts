import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { status, reviewNotes } = body;

        // Verify ownership/permissions if needed (e.g. only managers can approve)
        // For now, allow any authenticated user

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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Optionally delete the file from disk as well
        // For now just DB delete

        await prisma.evidence.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting evidence:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
