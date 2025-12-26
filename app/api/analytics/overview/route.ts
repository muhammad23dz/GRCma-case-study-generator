import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/analytics/overview - User-specific analytics
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            console.log('[Analytics] Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`[Analytics] Context resolved for User: ${context.email} (Org: ${context.orgId})`);

        // Get consistent filters using isolation utility
        const userFilter = getIsolationFilter(context, 'Control');
        const incidentFilter = getIsolationFilter(context, 'Incident');
        const reportFilter = getIsolationFilter(context, 'Report');
        // For models strictly scoped by Org ID (Expert Tier)
        const orgFilter = { organizationId: context.orgId };

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
            openFindings,
            activeRemediations,
            totalRequiredPolicies,
            approvedPolicies,
            // Gigachad GRC Modules
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
            prisma.change.count({ where: { requestedBy: context.email, status: { in: ['draft', 'reviewing', 'scheduled'] } } }),
            prisma.risk.count({ where: { ...userFilter, score: { gte: 20 } } }),
            prisma.risk.count({ where: { ...userFilter, score: { gte: 12, lt: 20 } } }),
            prisma.action.count({ where: { ...userFilter, status: 'open' } }),
            prisma.incident.count({ where: { ...incidentFilter, status: { in: ['open', 'investigating'] } } }),
            prisma.gap.count({ where: { ...userFilter, status: 'open' } }),
            prisma.auditFinding.count({ where: { status: 'open', control: userFilter } }),
            prisma.remediationStep.count({ where: { status: 'pending', gap: userFilter } }),
            prisma.policy.count({ where: userFilter }),
            prisma.policy.count({ where: { ...userFilter, status: 'active' } }),
            // Gigachad GRC Modules - Secured with proper isolation
            (prisma as any).bCDRPlan?.count?.({ where: userFilter }).catch(() => 0) ?? Promise.resolve(0),
            (prisma as any).asset?.count?.({ where: userFilter }).catch(() => 0) ?? Promise.resolve(0),
            (prisma as any).employee?.count?.({ where: orgFilter }).catch(() => 0) ?? Promise.resolve(0),
            (prisma as any).trainingCourse?.count?.({ where: orgFilter }).catch(() => 0) ?? Promise.resolve(0),
            (prisma as any).questionnaire?.count?.({ where: userFilter }).catch(() => 0) ?? Promise.resolve(0),
            (prisma as any).runbook?.count?.({ where: userFilter }).catch(() => 0) ?? Promise.resolve(0),
            (prisma as any).businessProcess?.count?.({ where: userFilter }).catch(() => 0) ?? Promise.resolve(0)
        ]);

        // Calculate Compliance Score (Expert Algorithm)
        const controlsWithEvidence = await prisma.control.count({
            where: { ...userFilter, evidences: { some: {} } }
        });
        const controlCompliance = totalControls > 0 ? (controlsWithEvidence / totalControls) : 1;

        const totalGaps = await prisma.gap.count({ where: userFilter });
        const resolvedGaps = await prisma.gap.count({ where: { ...userFilter, status: 'resolved' } });
        const gapClosure = totalGaps > 0 ? (resolvedGaps / totalGaps) : 1;

        const policyCompliance = totalRequiredPolicies > 0 ? (approvedPolicies / totalRequiredPolicies) : 1;

        const totalFindings = await prisma.auditFinding.count({ where: { control: userFilter } });
        const resolvedFindings = await prisma.auditFinding.count({
            where: { control: userFilter, status: 'resolved' }
        });
        const findingResolution = totalFindings > 0 ? (resolvedFindings / totalFindings) : 1;

        const weightedScore = (
            (controlCompliance * 40) +
            (gapClosure * 25) +
            (policyCompliance * 20) +
            (findingResolution * 15)
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
        const docFactor = totalControls > 0 ? (controlsWithDocs / totalControls) * 40 : 40;
        const evidenceFactor = totalControls > 0 ? (controlsWithEvidence / totalControls) * 60 : 60;
        const auditReadiness = Math.round(docFactor + evidenceFactor);

        // Grouped Analytics - All strictly scoped
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
                openIncidents, openGaps, openFindings, activeRemediations,
                complianceScore: finalComplianceScore, maturityLevel, auditReadiness,
                gapCount: openGaps,
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
