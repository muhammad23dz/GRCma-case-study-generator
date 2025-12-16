import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/analytics/control-coverage - Calculate control coverage metrics
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true } });
        const userEmail = dbUser?.email || '';

        // Get all risks for user
        const totalRisks = await prisma.risk.count({
            where: { owner: userEmail }
        });

        // Get risks with at least one control
        const risksWithControls = await prisma.riskControl.groupBy({
            by: ['riskId'],
            where: {
                risk: {
                    owner: userEmail
                }
            }
        });

        const coveredRisks = risksWithControls.length;
        const uncoveredRisks = totalRisks - coveredRisks;
        const coveragePercentage = totalRisks > 0
            ? Math.round((coveredRisks / totalRisks) * 100)
            : 0;

        // Get control effectiveness distribution
        const controlEffectiveness = await prisma.riskControl.groupBy({
            by: ['effectiveness'],
            where: {
                risk: {
                    owner: userEmail
                }
            },
            _count: true
        });

        // Calculate average residual risk
        const risksWithResidual = await prisma.riskControl.findMany({
            where: {
                risk: {
                    owner: userEmail
                }
            },
            select: {
                residualRisk: true
            }
        });

        const avgResidualRisk = risksWithResidual.length > 0
            ? Math.round(
                risksWithResidual.reduce((sum, rc) => sum + (rc.residualRisk || 0), 0) /
                risksWithResidual.length
            )
            : 0;

        // Get high-risk items without controls
        const highRisksWithoutControls = await prisma.risk.findMany({
            where: {
                owner: userEmail,
                score: { gte: 12 },
                riskControls: {
                    none: {}
                }
            },
            select: {
                id: true,
                narrative: true,
                score: true,
                category: true
            },
            take: 5
        });

        return NextResponse.json({
            summary: {
                totalRisks,
                coveredRisks,
                uncoveredRisks,
                coveragePercentage,
                avgResidualRisk
            },
            effectiveness: controlEffectiveness.map(e => ({
                level: e.effectiveness,
                count: e._count
            })),
            gaps: {
                highRisksWithoutControls: highRisksWithoutControls.map(r => ({
                    id: r.id,
                    narrative: r.narrative,
                    score: r.score,
                    category: r.category
                }))
            }
        });

    } catch (error: any) {
        console.error('Error calculating control coverage:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
