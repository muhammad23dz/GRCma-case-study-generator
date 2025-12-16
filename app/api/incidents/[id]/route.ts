import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { id } = params;

        const incident = await prisma.incident.findUnique({
            where: { id },
            include: {
                incidentControls: {
                    include: {
                        control: true
                    }
                },
                actions: true,
                incidentRisks: {
                    include: {
                        risk: true
                    }
                }
            }
        });

        if (!incident) {
            return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }

        return NextResponse.json({ incident });
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

        // Incident ownership usually 'reportedBy'
        const incident = await prisma.incident.findUnique({
            where: { id },
            select: { reportedBy: true }
        });

        if (!incident) {
            return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }

        const role = (session.user as any).role;
        const { canDeleteRecords } = await import('@/lib/permissions');

        if (!canDeleteRecords(role)) {
            return NextResponse.json({ error: 'Forbidden: Only Admins can delete incidents' }, { status: 403 });
        }

        await prisma.$transaction(async (tx) => {
            // 1. Delete linked Actions (No cascade in schema)
            await tx.action.deleteMany({ where: { incidentId: id } });

            // 2. Delete Incident
            await tx.incident.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
