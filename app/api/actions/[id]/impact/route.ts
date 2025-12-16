import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/actions/[id]/impact - Get action impact on risk reduction
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: actionId } = await params;

        // Get action with parent information
        const action = await prisma.action.findUnique({
            where: { id: actionId }
        });

        if (!action) {
            return NextResponse.json({ error: 'Action not found' }, { status: 404 });
        }

        let impact = {
            actionId: action.id,
            title: action.title,
            status: action.status,
            parentType: action.parentType,
            parentId: action.parentId,
            expectedRiskReduction: action.expectedRiskReduction,
            parent: null as any,
            actualImpact: null as any
        };

        // If action has a parent, get parent details
        if (action.parentType && action.parentId) {
            if (action.parentType === 'Risk') {
                const risk = await prisma.risk.findUnique({
                    where: { id: action.parentId },
                    include: {
                        riskControls: {
                            include: {
                                control: true
                            }
                        }
                    }
                });

                if (risk) {
                    impact.parent = {
                        type: 'Risk',
                        id: risk.id,
                        narrative: risk.narrative,
                        currentScore: risk.score,
                        controlCount: risk.riskControls.length
                    };

                    // If action is completed, show actual impact
                    if (action.status === 'completed' && action.expectedRiskReduction) {
                        impact.actualImpact = {
                            expectedReduction: action.expectedRiskReduction,
                            message: `This action was expected to reduce risk score by ${action.expectedRiskReduction} points`
                        };
                    }
                }
            } else if (action.parentType === 'Control') {
                const control = await prisma.control.findUnique({
                    where: { id: action.parentId },
                    include: {
                        riskControls: {
                            include: {
                                risk: true
                            }
                        }
                    }
                });

                if (control) {
                    impact.parent = {
                        type: 'Control',
                        id: control.id,
                        title: control.title,
                        controlType: control.controlType,
                        linkedRisks: control.riskControls.length
                    };
                }
            } else if (action.parentType === 'Incident') {
                const incident = await prisma.incident.findUnique({
                    where: { id: action.parentId }
                });

                if (incident) {
                    impact.parent = {
                        type: 'Incident',
                        id: incident.id,
                        title: incident.title,
                        severity: incident.severity,
                        status: incident.status
                    };
                }
            }
        }

        return NextResponse.json(impact);

    } catch (error: any) {
        console.error('Error getting action impact:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
