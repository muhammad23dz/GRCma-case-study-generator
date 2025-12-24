import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/risks/[id]/residual - Calculate residual risk for a specific risk
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: riskId } = await params;

        // Get risk with its controls
        const risk = await prisma.risk.findUnique({
            where: { id: riskId },
            include: {
                riskControls: {
                    include: {
                        control: true
                    }
                }
            }
        });

        if (!risk) {
            return NextResponse.json({ error: 'Risk not found' }, { status: 404 });
        }

        // Calculate residual risk
        const inherentRisk = risk.score;
        let totalControlEffectiveness = 0;
        let controlCount = risk.riskControls.length;

        if (controlCount === 0) {
            // No controls = residual risk equals inherent risk
            return NextResponse.json({
                riskId: risk.id,
                inherentRisk,
                residualRisk: inherentRisk,
                controlCount: 0,
                riskReduction: 0,
                riskReductionPercentage: 0,
                controls: []
            });
        }

        // Calculate average control effectiveness
        risk.riskControls.forEach(rc => {
            const effectiveness = rc.effectiveness;
            if (effectiveness === 'effective') {
                totalControlEffectiveness += 8; // Reduces risk by 8 points
            } else if (effectiveness === 'partial') {
                totalControlEffectiveness += 5; // Reduces risk by 5 points
            } else if (effectiveness === 'ineffective') {
                totalControlEffectiveness += 1; // Minimal reduction
            }
        });

        const averageReduction = Math.floor(totalControlEffectiveness / controlCount);
        const residualRisk = Math.max(1, inherentRisk - averageReduction);
        const riskReduction = inherentRisk - residualRisk;
        const riskReductionPercentage = Math.round((riskReduction / inherentRisk) * 100);

        return NextResponse.json({
            riskId: risk.id,
            narrative: risk.narrative,
            category: risk.category,
            inherentRisk,
            residualRisk,
            controlCount,
            riskReduction,
            riskReductionPercentage,
            controls: risk.riskControls.map(rc => ({
                id: rc.control.id,
                title: rc.control.title,
                controlType: rc.control.controlType,
                effectiveness: rc.effectiveness,
                notes: rc.notes
            }))
        });

    } catch (error: any) {
        console.error('Error calculating residual risk:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
