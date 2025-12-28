import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';

// GET /api/changes
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Apply isolation filter
        const whereClause = getIsolationFilter(context, 'Change');

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
    } catch (error: unknown) {
        console.error('Error fetching changes:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// POST /api/changes
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userEmail = context.email;
        const orgId = context.orgId;

        const body = await request.json();

        // Auto-generate Change Number
        const year = new Date().getFullYear();
        const count = await prisma.change.count({ where: { organizationId: orgId } });
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
                requestedDate: body.requestedDate ? new Date(body.requestedDate) : new Date(),
                implementationPlan: body.implementationPlan,
                backoutPlan: body.backoutPlan,
                affectedSystems: body.affectedSystems || [],
                currentStage: 'assessment',
                requestedBy: userEmail,
                organizationId: orgId
            }
        });

        // GRC Automation: Auto-create Risk if Score is High (>12)
        if (riskScore > 12 && orgId) {
            const { createChangeRisk } = await import('@/lib/grc-automation');
            await createChangeRisk(change.id, riskScore, orgId);
        }

        return NextResponse.json({ change }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating change:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
