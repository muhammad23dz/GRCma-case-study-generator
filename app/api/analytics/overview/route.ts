import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/analytics/overview
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            console.error('Unauthorized access attempt to analytics API');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all metrics
        const [
            totalControls,
            totalRisks,
            totalVendors,
            totalActions,
            totalIncidents,
            totalPolicies,
            totalChanges,
            criticalRisks,
            highRisks,
            openActions,
            openIncidents
        ] = await Promise.all([
            prisma.control.count(),
            prisma.risk.count(),
            prisma.vendor.count(),
            prisma.action.count(),
            prisma.incident.count(),
            prisma.policy.count(),
            prisma.change.count({ where: { status: { in: ['draft', 'reviewing', 'scheduled'] } } }), // Pending changes
            prisma.risk.count({ where: { score: { gte: 20 } } }), // Critical (4x5, 5x4, 5x5)
            prisma.risk.count({ where: { score: { gte: 12, lt: 20 } } }), // High (3x4, 4x3, 4x4, etc)
            prisma.action.count({ where: { status: 'open' } }),
            prisma.incident.count({ where: { status: { in: ['open', 'investigating'] } } })
        ]);

        // Calculate compliance score (controls with evidence / total controls)
        const controlsWithEvidence = await prisma.control.count({
            where: { evidences: { some: {} } }
        });
        const complianceScore = totalControls > 0
            ? Math.round((controlsWithEvidence / totalControls) * 100)
            : 0;

        // Risk trends (by category)
        const riskDistribution = await prisma.risk.groupBy({
            by: ['category'],
            _count: true,
        });

        // Get user email for risk filtering
        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true } });
        const userEmail = dbUser?.email || '';

        // Get risks for heatmap
        const heatmapRisks = await prisma.risk.findMany({
            where: { owner: userEmail },
            select: {
                id: true,
                narrative: true,
                likelihood: true,
                impact: true,
                score: true,
                category: true,
            },
            take: 100 // Cap to prevent overload, though matrix handles many
        });


        return NextResponse.json({
            overview: {
                totalControls,
                totalRisks,
                totalVendors,
                totalActions,
                totalIncidents,
                totalPolicies,
                criticalRisks,
                highRisks,
                openActions,
                openIncidents,
                complianceScore
            },
            riskDistribution,
            heatmapRisks
        });
    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
