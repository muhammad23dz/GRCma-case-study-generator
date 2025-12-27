import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/remediation - List relevant gaps and actions
export async function GET() {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const whereClause = orgId ? { organizationId: orgId } : {};

        // Fetch Gaps (from Gap Analysis)
        const gaps = await prisma.gap.findMany({
            where: {
                ...whereClause,
                status: { not: 'resolved' } // Only show open gaps
            },
            include: {
                remediationSteps: true
            },
            orderBy: { severity: 'asc' } // Critical first (by string value? No, critical > high > medium > low. Need custom sort or rely on client)
        });

        // Fetch Actions (from Controls/Risks) that are 'corrective'
        const actions = await prisma.action.findMany({
            where: {
                ...whereClause,
                type: 'corrective',
                status: { not: 'completed' }
            },
            include: {
                risk: { select: { narrative: true } },
                control: { select: { title: true } },
                incident: { select: { title: true } }
            },
            orderBy: { priority: 'asc' }
        });

        return NextResponse.json({ gaps, actions });
    } catch (error: any) {
        console.error('Error fetching remediation data:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/remediation - Create a generic remediation task (Action)
export async function POST(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, priority, dueDate, type } = body;

        const action = await prisma.action.create({
            data: {
                title,
                description,
                priority: priority || 'medium',
                type: type || 'corrective',
                status: 'open',
                dueDate: dueDate ? new Date(dueDate) : undefined,
                organizationId: orgId || undefined,
                assignedTo: 'Unassigned' // Default
            }
        });

        return NextResponse.json({ action }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating remediation action:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
