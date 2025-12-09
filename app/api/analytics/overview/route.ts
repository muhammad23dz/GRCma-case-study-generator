import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET /api/analytics/overview
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
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
            riskDistribution
        });
    } catch (error: any) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
