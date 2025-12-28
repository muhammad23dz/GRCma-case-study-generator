import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/analytics/control-coverage - Calculate control coverage metrics for the organization
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const orgId = context.orgId;

        // Get all risks for the organization
        const totalRisks = await prisma.risk.count({
            where: { organizationId: orgId }
        });

        // Get risks with at least one control
        const risksWithControls = await prisma.riskControl.groupBy({
            by: ['riskId'],
            where: {
                risk: {
                    organizationId: orgId
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
                    organizationId: orgId
                }
            },
            _count: true
        });

        // Calculate average residual risk
        const risksWithResidual = await prisma.riskControl.findMany({
            where: {
                risk: {
                    organizationId: orgId
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
                organizationId: orgId,
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
        const { message, status, code } = safeError(error, 'Control Coverage Analytics');
        return NextResponse.json({ error: message, code }, { status });
    }
}
