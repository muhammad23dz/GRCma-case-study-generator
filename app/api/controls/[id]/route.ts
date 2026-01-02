import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { safeError } from '@/lib/security';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';

export async function GET(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;

        const control = await prisma.control.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'Control')
            },
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
            return NextResponse.json({ error: 'Control not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ control });
    } catch (error: unknown) {
        console.error('Error fetching control:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;

        const control = await prisma.control.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'Control')
            },
            select: { id: true, owner: true }
        });

        if (!control) {
            return NextResponse.json({ error: 'Control not found or access denied' }, { status: 404 });
        }

        await prisma.control.delete({ where: { id } });

        await logAudit({
            entity: 'Control',
            entityId: id,
            action: 'DELETE',
            changes: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting control:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
