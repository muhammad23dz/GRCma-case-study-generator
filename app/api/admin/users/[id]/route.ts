import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/users/[id] - Update User Role
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { role: true } });
        if (dbUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { id } = await context.params;
        const { role } = await request.json();

        if (!role) return NextResponse.json({ error: 'Role is required' }, { status: 400 });

        // Prevent modifying self role (safety)
        if (userId === id) {
            return NextResponse.json({ error: 'Cannot modify your own role' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role }
        });

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id] - Revoke access
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    console.log('[API] DELETE /api/admin/users/[id] - Start');
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { role: true } });
        if (dbUser?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { id } = await context.params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'user';

        console.log(`[API] Deleting ${type} with ID: ${id}`);

        // Check if removing self
        if (userId === id && type === 'user') {
            return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 });
        }

        if (type === 'invitation') {
            await prisma.invitation.delete({ where: { id } });
        } else {
            await prisma.subscription.deleteMany({ where: { userId: id } });
            await prisma.user.delete({ where: { id } });
        }

        console.log('[API] Delete Success');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API] DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
