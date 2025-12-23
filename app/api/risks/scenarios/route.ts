import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/risks/scenarios - Get Risk Scenarios (What-If Analysis)
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        // Get all risks with full relations for scenario analysis
        const risks = await prisma.risk.findMany({
            where: { owner: userEmail },
            include: {
                control: true,
                riskControls: {
                    include: { control: true }
                },
                vendorRisks: {
                    include: { vendor: true }
                },
                assetRisks: {
                    include: { asset: true }
                }
            },
            orderBy: { score: 'desc' }
        });

        // Generate scenario data
        const scenarios = risks.map(risk => {
            const currentScore = risk.score;
            const mitigatedScore = Math.max(1, Math.floor(currentScore * 0.3));
            const escalatedScore = Math.min(25, Math.floor(currentScore * 1.5));

            // Calculate potential impact reduction if controls are implemented
            const controlCount = risk.riskControls?.length || 0;
            const potentialReduction = controlCount > 0 ? Math.min(80, controlCount * 15) : 0;

            return {
                id: risk.id,
                category: risk.category,
                narrative: risk.narrative,
                currentLikelihood: risk.likelihood,
                currentImpact: risk.impact,
                currentScore,
                status: risk.status,
                scenarios: {
                    bestCase: {
                        score: mitigatedScore,
                        description: 'All controls implemented and effective',
                        reduction: Math.round((1 - mitigatedScore / currentScore) * 100)
                    },
                    worstCase: {
                        score: escalatedScore,
                        description: 'Controls fail or threat landscape worsens',
                        increase: Math.round((escalatedScore / currentScore - 1) * 100)
                    },
                    likelyCase: {
                        score: Math.max(1, currentScore - Math.floor(potentialReduction / 10)),
                        description: 'Partial control implementation'
                    }
                },
                linkedControls: risk.riskControls?.length || 0,
                linkedAssets: risk.assetRisks?.length || 0,
                linkedVendors: risk.vendorRisks?.length || 0,
                potentialReduction
            };
        });

        // Aggregate statistics
        const stats = {
            totalRisks: risks.length,
            averageScore: risks.length > 0 ? Math.round(risks.reduce((a, r) => a + r.score, 0) / risks.length) : 0,
            criticalRisks: risks.filter(r => r.score >= 15).length,
            highRisks: risks.filter(r => r.score >= 10 && r.score < 15).length,
            potentialSavings: scenarios.reduce((a, s) => a + (s.currentScore - s.scenarios.bestCase.score), 0),
        };

        return NextResponse.json({ scenarios, stats });
    } catch (error: any) {
        console.error('Error fetching risk scenarios:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/risks/scenarios - Run What-If Simulation
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { riskId, newLikelihood, newImpact, controlsToAdd, controlsToRemove } = body;

        // Find the risk
        const risk = await prisma.risk.findUnique({
            where: { id: riskId },
            include: { riskControls: true }
        });

        if (!risk) {
            return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
        }

        // Calculate new score
        const likelihood = newLikelihood ?? risk.likelihood;
        const impact = newImpact ?? risk.impact;
        const newScore = likelihood * impact;

        // Calculate control effect
        const currentControls = risk.riskControls?.length || 0;
        const netControlChange = (controlsToAdd || 0) - (controlsToRemove || 0);
        const newControlCount = Math.max(0, currentControls + netControlChange);
        const controlReduction = Math.min(60, newControlCount * 12);
        const adjustedScore = Math.max(1, Math.floor(newScore * (1 - controlReduction / 100)));

        return NextResponse.json({
            simulation: {
                originalScore: risk.score,
                rawNewScore: newScore,
                adjustedScore,
                controlReduction: `${controlReduction}%`,
                effectiveControls: newControlCount,
                riskLevel: adjustedScore >= 15 ? 'critical' : adjustedScore >= 10 ? 'high' : adjustedScore >= 5 ? 'medium' : 'low',
                recommendation: adjustedScore >= 10
                    ? 'Consider adding more controls or accepting residual risk'
                    : 'Risk is within acceptable tolerance'
            }
        });
    } catch (error: any) {
        console.error('Error running risk simulation:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
