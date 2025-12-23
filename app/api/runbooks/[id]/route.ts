import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/runbooks/[id] - Get single Runbook
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

        const runbook = await prisma.runbook.findUnique({
            where: { id },
            include: {
                steps: { orderBy: { stepNumber: 'asc' } },
                executions: { orderBy: { startedAt: 'desc' }, take: 10 }
            }
        });

        if (!runbook) {
            return NextResponse.json({ error: 'Runbook not found' }, { status: 404 });
        }

        return NextResponse.json({ runbook });
    } catch (error: any) {
        console.error('Error fetching runbook:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/runbooks/[id] - Update Runbook
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/runbooks/[id] - Delete Runbook
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

        await prisma.runbook.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Runbook deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting runbook:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
