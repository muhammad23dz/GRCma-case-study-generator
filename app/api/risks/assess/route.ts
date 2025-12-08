import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';

// POST /api/risks/assess - LLM-powered risk assessment
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { assetId, controlId, evidenceItems } = body;

        // Get historical risk if exists
        const historicalRisk = controlId ? await prisma.risk.findFirst({
            where: { controlId, status: { not: 'closed' } },
            orderBy: { createdAt: 'desc' }
        }) : null;

        // Call LLM for risk assessment
        const result = await grcLLM.assessRisk({
            assetId,
            controlId,
            evidenceItems: evidenceItems || [],
            historicalRisk: historicalRisk ? {
                likelihood: historicalRisk.likelihood,
                impact: historicalRisk.impact
            } : undefined
        });

        // Create risk record
        const risk = await prisma.risk.create({
            data: {
                assetId,
                controlId,
                likelihood: result.data.likelihood,
                impact: result.data.impact,
                score: result.data.score,
                category: result.data.category,
                narrative: result.data.narrative,
                drivers: JSON.stringify(result.data.drivers),
                recommendedActions: JSON.stringify(result.data.recommendedActions),
                llmConfidence: result.confidence,
                llmProvenance: JSON.stringify(result.provenance),
                status: 'open'
            }
        });

        // Auto-create high-priority actions for critical risks
        if (result.data.category === 'Critical' || result.data.category === 'High') {
            const highPriorityActions = result.data.recommendedActions
                .filter((a: any) => a.priority === 'critical' || a.priority === 'high')
                .slice(0, 3);

            for (const action of highPriorityActions) {
                await prisma.action.create({
                    data: {
                        type: 'remediation',
                        title: action.action,
                        description: `Auto-generated from risk assessment: ${result.data.narrative}`,
                        controlId,
                        owner: session.user.email!,
                        severity: action.priority,
                        status: 'open'
                    }
                });
            }
        }

        return NextResponse.json({
            risk,
            assessment: result.data,
            confidence: result.confidence,
            actionsCreated: result.data.category === 'Critical' || result.data.category === 'High'
        });
    } catch (error: any) {
        console.error('Error assessing risk:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
