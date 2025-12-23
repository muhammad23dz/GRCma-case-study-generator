import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { result, notes, evidenceId } = body;

        const test = await prisma.controlTest.update({
            where: { id },
            data: {
                result,
                notes,
                evidenceId // Can link evidence later
            }
        });

        return NextResponse.json({ test });
    } catch (error: unknown) {
        console.error('Error updating control test:', error);
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

        // Only managers/admins/analysts can delete
        if (role === 'user') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await context.params;
        await prisma.controlTest.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting control test:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
