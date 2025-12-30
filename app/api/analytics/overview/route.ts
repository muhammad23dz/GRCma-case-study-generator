import { NextRequest, NextResponse } from 'next/server';
import { safeError } from '@/lib/security';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/analytics/overview - User-specific analytics
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Infrastructure context required.' }, { status: 401 });
        }

        console.log(`[Analytics] Context resolved for User: ${context.email} (Org: ${context.orgId})`);

        // Get consistent filters using isolation utility
        const userFilter = getIsolationFilter(context, 'Control');
        const incidentFilter = getIsolationFilter(context, 'Incident');
        const orgId = context.orgId || undefined;
        const orgFilter = { organizationId: orgId };

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
            openIncidents,
            openGaps,
            totalRequiredPolicies,
            approvedPolicies,
            // Premium Modules
            totalBCDRPlans,
            totalAssets,
            totalEmployees,
            totalTrainingCourses,
            totalQuestionnaires,
            totalRunbooks,
            totalProcesses
        ] = await Promise.all([
            prisma.control.count({ where: userFilter }),
            prisma.risk.count({ where: userFilter }),
            prisma.vendor.count({ where: userFilter }),
            prisma.action.count({ where: userFilter }),
            prisma.incident.count({ where: incidentFilter }),
            prisma.policy.count({ where: userFilter }),
            prisma.change.count({ where: { organizationId: orgId } }),
            prisma.risk.count({ where: { ...userFilter, score: { gte: 20 } } }),
            prisma.risk.count({ where: { ...userFilter, score: { gte: 12, lt: 20 } } }),
            prisma.action.count({ where: { ...userFilter, status: 'open' } }),
            prisma.incident.count({ where: { ...incidentFilter, status: { in: ['open', 'investigating'] } } }),
            prisma.gap.count({ where: { ...userFilter, status: 'open' } }),
            prisma.policy.count({ where: userFilter }),
            prisma.policy.count({ where: { ...userFilter, status: 'active' } }),

            // Safe counters for dynamic models
            prisma.bCDRPlan.count({ where: { organizationId: orgId } }).catch(() => 0),
            prisma.asset.count({ where: { organizationId: orgId } }).catch(() => 0),
            prisma.employee.count({ where: orgFilter }).catch(() => 0),
            prisma.trainingCourse.count({ where: orgFilter }).catch(() => 0),
            prisma.questionnaire.count({ where: { organizationId: orgId } }).catch(() => 0),
            prisma.runbook.count({ where: { organizationId: orgId } }).catch(() => 0),
            prisma.businessProcess.count({ where: { organizationId: orgId } }).catch(() => 0)
        ]);

        // Calculate Compliance Score
        const controlsWithEvidence = await prisma.control.count({
            where: { ...userFilter, evidences: { some: {} } }
        });
        const controlCompliance = totalControls > 0 ? (controlsWithEvidence / totalControls) : 0;

        const totalGaps = await prisma.gap.count({ where: userFilter });
        const resolvedGaps = await prisma.gap.count({ where: { ...userFilter, status: 'resolved' } });
        const gapClosure = totalGaps > 0 ? (resolvedGaps / totalGaps) : 0;

        const policyCompliance = totalRequiredPolicies > 0 ? (approvedPolicies / totalRequiredPolicies) : 0;

        const weightedScore = (
            (controlCompliance * 40) +
            (gapClosure * 35) +
            (policyCompliance * 25)
        );
        const finalComplianceScore = Math.round(weightedScore);

        let maturityLevel = "Initial";
        if (finalComplianceScore > 80) maturityLevel = "Optimizing";
        else if (finalComplianceScore > 60) maturityLevel = "Managed";
        else if (finalComplianceScore > 40) maturityLevel = "Defined";
        else if (finalComplianceScore > 20) maturityLevel = "Developing";

        const controlsWithDocs = await prisma.control.count({
            where: { ...userFilter, description: { not: "" } }
        });
        const docFactor = totalControls > 0 ? (controlsWithDocs / totalControls) * 40 : 0;
        const evidenceFactor = totalControls > 0 ? (controlsWithEvidence / totalControls) * 60 : 0;
        const auditReadiness = Math.round(docFactor + evidenceFactor);

        // Grouped Analytics
        const [
            riskDistribution,
            controlsByType,
            vendorsByCriticality,
            vendorsByStatus,
            heatmapRisks
        ] = await Promise.all([
            prisma.risk.groupBy({ by: ['category'], where: userFilter, _count: true }),
            prisma.control.groupBy({ by: ['controlType'], where: userFilter, _count: true }),
            prisma.vendor.groupBy({ by: ['criticality'], where: userFilter, _count: true }),
            prisma.vendor.groupBy({ by: ['status'], where: userFilter, _count: true }),
            prisma.risk.findMany({
                where: userFilter,
                select: { id: true, narrative: true, likelihood: true, impact: true, score: true, category: true },
                take: 100
            })
        ]);

        return NextResponse.json({
            overview: {
                totalControls, totalRisks, totalVendors, totalActions, totalIncidents,
                totalPolicies, totalChanges, criticalRisks, highRisks, openActions,
                openIncidents, openGaps, complianceScore: finalComplianceScore,
                maturityLevel, auditReadiness, gapCount: openGaps,
                totalBCDRPlans, totalAssets, totalEmployees, totalTrainingCourses,
                totalQuestionnaires, totalRunbooks, totalProcesses
            },
            riskDistribution,
            controlsByType,
            vendorsByCriticality,
            vendorsByStatus,
            heatmapRisks
        });
    } catch (error: unknown) {
        console.error('[Analytics] Critical failure:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
