import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/changes
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';
        const userRole = (user?.publicMetadata as any)?.role || 'user';
        const isAdmin = ['admin', 'manager'].includes(userRole);

        const whereClause = isAdmin ? {} : { requestedBy: userEmail };

        const changes = await prisma.change.findMany({
            where: whereClause,
            include: {
                approvals: true,
                risks: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({ changes });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/changes
export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userId || !userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // RBAC Check: All Authenticated Users can CREATE changes (Self-Service)
        // We only block completely unauthenticated users (handled above)
        // Managers/Admins will then process them.

        const body = await request.json();

        // Auto-generate Change Number
        const year = new Date().getFullYear();
        const count = await prisma.change.count();
        const changeNumber = `CHG-${year}-${(count + 1).toString().padStart(3, '0')}`;

        // Basic Risk Calculation
        const { impactLevel, urgency, complexity } = body;
        const impactScore = impactLevel === 'high' ? 5 : impactLevel === 'medium' ? 3 : 1;
        const urgencyScore = urgency === 'critical' ? 5 : urgency === 'high' ? 4 : urgency === 'medium' ? 3 : 2;
        const complexityScore = complexity === 'complex' ? 5 : complexity === 'moderate' ? 3 : 1;

        const riskScore = impactScore * urgencyScore * complexityScore;

        const change = await prisma.change.create({
            data: {
                changeNumber,
                title: body.title,
                description: body.description,
                justification: body.justification,
                changeType: body.changeType,
                category: body.category,
                priority: body.priority,
                impactLevel,
                urgency,
                complexity,
                riskScore,
                requestedDate: new Date(body.requestedDate),
                implementationPlan: body.implementationPlan,
                backoutPlan: body.backoutPlan,
                affectedSystems: JSON.stringify(body.affectedSystems || []),
                currentStage: 'assessment', // Initial stage
                requestedBy: userEmail,
            }
        });

        // GRC Automation: Auto-create Risk if Score is High (>12)
        if (riskScore > 12) {
            const { createChangeRisk } = await import('@/lib/grc-automation');
            await createChangeRisk(change.id, riskScore);
        }

        return NextResponse.json({ change }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating change:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
