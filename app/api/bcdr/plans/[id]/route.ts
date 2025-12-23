import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/bcdr/plans/[id] - Get single BCDR Plan
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

        const plan = await prisma.bCDRPlan.findUnique({
            where: { id },
            include: {
                tests: { orderBy: { testDate: 'desc' } },
                processes: true
            }
        });

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/bcdr/plans/[id] - Delete BCDR Plan
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await prisma.bCDRPlan.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Plan deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting BCDR plan:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
