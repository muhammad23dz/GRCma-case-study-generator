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
    } catch (error: unknown) {
        console.error('Error fetching incident:', error);
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

        // Incident ownership usually 'reportedBy'
        const incident = await prisma.incident.findUnique({
            where: { id },
            select: { reportedBy: true }
        });

        if (!incident) {
            return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }

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
    } catch (error: unknown) {
        console.error('Error deleting incident:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
