import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

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

        const policy = await prisma.policy.findUnique({
            where: { id },
            include: {
                policyControls: {
                    include: {
                        control: true
                    }
                },
                versions: {
                    orderBy: { createdAt: 'desc' }
                },
                attestations: {
                    orderBy: { attestedAt: 'desc' }
                }
            }
        });

        if (!policy) {
            return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
        }

        return NextResponse.json({ policy });
    } catch (error: unknown) {
        console.error('Error fetching policy:', error);
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

        const { id } = await context.params;
        const policy = await prisma.policy.findUnique({
            where: { id },
            select: { owner: true }
        });

        if (!policy) {
            return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
        }

        const { canDeleteRecords } = await import('@/lib/permissions');

        if (!canDeleteRecords(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Admins can delete policies' }, { status: 403 });
        }

        await prisma.policy.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting policy:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
