import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/bcdr/plans/[id] - Get single BCDR Plan
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

        const plan = await prisma.bCDRPlan.findFirst({
            where: {
                id,
                ...getIsolationFilter(context, 'BCDRPlan')
            },
            include: {
                tests: { orderBy: { testDate: 'desc' } },
                processes: true
            }
        });

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
        }

        return NextResponse.json({ plan });
    } catch (error: any) {
        console.error('Error fetching BCDR plan:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/bcdr/plans/[id] - Update BCDR Plan
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
        const isolationFilter = getIsolationFilter(context, 'BCDRPlan');

        // Verify existence before update
        const existing = await prisma.bCDRPlan.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
        }

        const plan = await prisma.bCDRPlan.update({
            where: { id },
            data: {
                title: body.title,
                type: body.type,
                status: body.status,
                description: body.description,
                rto: body.rto,
                rpo: body.rpo,
                mtpd: body.mtpd,
                nextTestDate: body.nextTestDate ? new Date(body.nextTestDate) : null,
                version: body.version
            }
        });

        return NextResponse.json({ plan });
    } catch (error: any) {
        console.error('Error updating BCDR plan:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// DELETE /api/bcdr/plans/[id] - Delete BCDR Plan
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
        const isolationFilter = getIsolationFilter(context, 'BCDRPlan');

        // Verify existence before delete
        const existing = await prisma.bCDRPlan.findFirst({
            where: { id, ...isolationFilter }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Plan not found or access denied' }, { status: 404 });
        }

        await prisma.bCDRPlan.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Plan deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting BCDR plan:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
