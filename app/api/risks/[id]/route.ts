import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Ensure this path is correct
import { prisma } from '@/lib/prisma'; // Ensure this path is correct

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

        const risk = await prisma.risk.findUnique({
            where: { id },
            select: { owner: true }
        });

        if (!risk) {
            return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
        }

        // Optional: strict check. 
        // If 'owner' is null (legacy data), maybe allow deletion or assign to current user? 
        // For now, if owner exists and mismatch, forbid.
        if (risk.owner && risk.owner !== session.user.email) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.risk.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
