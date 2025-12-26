import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true, role: true } });
        const userEmail = dbUser?.email || '';
        const userRole = dbUser?.role || 'user';

        const { id } = await context.params;

        // Verify ownership
        const action = await prisma.action.findUnique({
            where: { id },
            select: { owner: true }
        });

        if (!action) {
            return NextResponse.json({ error: 'Action not found' }, { status: 404 });
        }

        if (action.owner !== userEmail) {
            if (userRole !== 'admin' && action.owner !== userEmail) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        await prisma.action.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting action:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
