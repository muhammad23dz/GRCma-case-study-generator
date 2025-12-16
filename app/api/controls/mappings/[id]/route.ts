import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/controls/mappings/:id - Delete a mapping
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: controlId } = await params;

        await prisma.frameworkMapping.delete({
            where: { id: controlId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting mapping:', error);
        return NextResponse.json(
            { error: 'Failed to delete mapping' },
            { status: 500 }
        );
    }
}
