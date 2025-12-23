import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await context.params;

        const control = await prisma.control.findUnique({
            where: { id },
            include: {
                policyControls: {
                    include: {
                        policy: true
                    }
                },
                auditFindings: {
                    include: {
                        audit: true
                    }
                },
                incidentControls: {
                    include: {
                        incident: true
                    }
                },
                evidences: true,
                risks: true,
            }
        });

        if (!control) {
            return NextResponse.json({ error: 'Control not found' }, { status: 404 });
        }

        return NextResponse.json({ control });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true } });
        const userEmail = dbUser?.email || '';

        const { id } = await context.params;

        const control = await prisma.control.findUnique({
            where: { id },
            select: { owner: true }
        });

        if (!control) {
            return NextResponse.json({ error: 'Control not found' }, { status: 404 });
        }

        // Strict ownership check
        if (control.owner && control.owner !== userEmail) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.control.delete({ where: { id } });

        await logAudit({
            entity: 'Control',
            entityId: id,
            action: 'DELETE',
            changes: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
