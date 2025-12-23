import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/runbooks - List Runbooks
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const runbooks = await prisma.runbook.findMany({
            where: { owner: userEmail },
            include: {
                _count: {
                    select: { steps: true, executions: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ runbooks });
    } catch (error: any) {
        console.error('Error fetching runbooks:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/runbooks - Create Runbook
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const body = await request.json();
        const { title, description, type, triggerCondition, estimatedTime } = body;

        const runbook = await prisma.runbook.create({
            data: {
                title,
                description,
                type: type || 'incident_response',
                triggerCondition,
                estimatedTime,
                owner: userEmail,
                status: 'active'
            }
        });

        return NextResponse.json({ runbook }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating runbook:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
