import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/processes/[id] - Get single Business Process
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

        const process = await prisma.businessProcess.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'BusinessProcess')
            },
            include: {
                bcdrPlan: true
            }
        });

        if (!process) {
            return NextResponse.json({ error: 'Process not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ process });
    } catch (error: any) {
        console.error('Error fetching business process:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// PATCH /api/processes/[id] - Update Business Process
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
        const isolationFilter = getIsolationFilter(context, 'BusinessProcess');

        // Verify existence before update
        const existing = await prisma.businessProcess.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Process not found or access denied' }, { status: 404 });
        }

        const process = await prisma.businessProcess.update({
            where: { id },
            data: {
                name: body.name,
                description: body.description,
                criticality: body.criticality,
                status: body.status,
                rto: body.rto,
                rpo: body.rpo,
                bcdrPlanId: body.bcdrPlanId,
                dependencies: body.dependencies ? JSON.stringify(body.dependencies) : null,
                stakeholders: body.stakeholders ? JSON.stringify(body.stakeholders) : null
            }
        });

        return NextResponse.json({ process });
    } catch (error: any) {
        console.error('Error updating business process:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// DELETE /api/processes/[id] - Delete Business Process
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
        const isolationFilter = getIsolationFilter(context, 'BusinessProcess');

        // Verify existence before delete
        const existing = await prisma.businessProcess.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Process not found or access denied' }, { status: 404 });
        }

        await prisma.businessProcess.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Process deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting business process:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
