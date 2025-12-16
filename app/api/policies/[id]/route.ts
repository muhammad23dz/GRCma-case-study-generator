import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = params;

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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        const policy = await prisma.policy.findUnique({
            where: { id },
            select: { owner: true }
        });

        if (!policy) {
            return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
        }

        const role = (session.user as any).role;
        const { canDeleteRecords } = await import('@/lib/permissions');

        if (!canDeleteRecords(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Admins can delete policies' }, { status: 403 });
        }

        await prisma.policy.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
