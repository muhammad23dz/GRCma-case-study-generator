import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/processes - List Business Processes
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const processes = await prisma.businessProcess.findMany({
            where: { owner: userEmail },
            include: {
                bcdrPlan: {
                    select: { id: true, title: true, type: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ processes });
    } catch (error: any) {
        console.error('Error fetching business processes:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/processes - Create Business Process
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        const body = await request.json();
        const { name, description, criticality, rto, rpo, bcdrPlanId, dependencies, stakeholders } = body;

        const process = await prisma.businessProcess.create({
            data: {
                name,
                description,
                criticality: criticality || 'medium',
                rto,
                rpo,
                bcdrPlanId,
                dependencies: dependencies ? JSON.stringify(dependencies) : null,
                stakeholders: stakeholders ? JSON.stringify(stakeholders) : null,
                owner: userEmail,
                status: 'active'
            }
        });

        return NextResponse.json({ process }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating business process:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
