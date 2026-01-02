import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/runbooks/[id] - Get single Runbook
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

        const runbook = await prisma.runbook.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'Runbook')
            },
            include: {
                steps: { orderBy: { stepNumber: 'asc' } },
                executions: { orderBy: { triggeredAt: 'desc' }, take: 10 }
            }
        });

        if (!runbook) {
            return NextResponse.json({ error: 'Runbook not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ runbook });
    } catch (error: any) {
        console.error('Error fetching runbook:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// PATCH /api/runbooks/[id] - Update Runbook
export async function PATCH(
    request: NextRequest,
    routeContext: { params: Promise<{ id: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await routeContext.params;
        const body = await request.json();
        const isolationFilter = getIsolationFilter(context, 'Runbook');

        // Verify existence before update
        const existing = await prisma.runbook.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Runbook not found or access denied' }, { status: 404 });
        }

        const runbook = await prisma.runbook.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                type: body.type,
                status: body.status,
                triggerCondition: body.triggerCondition,
                estimatedTime: body.estimatedTime,
                version: body.version
            }
        });

        return NextResponse.json({ runbook });
    } catch (error: any) {
        console.error('Error updating runbook:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// DELETE /api/runbooks/[id] - Delete Runbook
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
        const isolationFilter = getIsolationFilter(context, 'Runbook');

        // Verify existence before delete
        const existing = await prisma.runbook.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Runbook not found or access denied' }, { status: 404 });
        }

        await prisma.runbook.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Runbook deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting runbook:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
