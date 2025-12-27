import { NextRequest, NextResponse } from 'next/server';
import { safeError } from '@/lib/security';

export const dynamic = 'force-dynamic';

// Check if we have a valid DATABASE_URL
const hasValidDb = process.env.DATABASE_URL?.startsWith('postgres');

// Demo analytics for display when DB is unavailable
const DEMO_ANALYTICS = {
    overview: {
        totalControls: 47, totalRisks: 23, totalVendors: 12, totalActions: 18, totalIncidents: 3,
        totalPolicies: 8, totalChanges: 5, criticalRisks: 2, highRisks: 6, openActions: 7,
        openIncidents: 1, openGaps: 4, openFindings: 2, activeRemediations: 3,
        complianceScore: 72, maturityLevel: 'Managed', auditReadiness: 68,
        gapCount: 4,
        totalBCDRPlans: 2, totalAssets: 35, totalEmployees: 24, totalTrainingCourses: 5,
        totalQuestionnaires: 3, totalRunbooks: 7, totalProcesses: 12
    },
    riskDistribution: [
        { category: 'security', _count: 8 },
        { category: 'operational', _count: 6 },
        { category: 'compliance', _count: 5 },
        { category: 'privacy', _count: 4 }
    ],
    controlsByType: [
        { controlType: 'preventive', _count: 18 },
        { controlType: 'detective', _count: 12 },
        { controlType: 'corrective', _count: 9 },
        { controlType: 'directive', _count: 8 }
    ],
    vendorsByCriticality: [
        { criticality: 'critical', _count: 2 },
        { criticality: 'high', _count: 3 },
        { criticality: 'medium', _count: 5 },
        { criticality: 'low', _count: 2 }
    ],
    vendorsByStatus: [
        { status: 'active', _count: 10 },
        { status: 'suspended', _count: 1 },
        { status: 'terminated', _count: 1 }
    ],
    heatmapRisks: [
        { id: 'demo-1', narrative: 'Unauthorized access to sensitive data', likelihood: 4, impact: 5, score: 20, category: 'security' },
        { id: 'demo-2', narrative: 'System downtime during peak hours', likelihood: 3, impact: 4, score: 12, category: 'operational' },
        { id: 'demo-3', narrative: 'GDPR compliance gaps', likelihood: 3, impact: 3, score: 9, category: 'compliance' },
        { id: 'demo-4', narrative: 'Vendor data breach exposure', likelihood: 2, impact: 5, score: 10, category: 'security' }
    ],
    isDemo: true
};

// GET /api/analytics/overview - User-specific analytics
export async function GET(request: NextRequest) {
    // If no valid DB, return demo data immediately
    if (!hasValidDb) {
        console.log('[Analytics] No valid DATABASE_URL, returning demo data');
        return NextResponse.json(DEMO_ANALYTICS);
    }

    try {
        // Dynamic imports to avoid initialization errors
        const { prisma } = await import('@/lib/prisma');
        const { getIsolationContext, getIsolationFilter } = await import('@/lib/isolation');

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
        const orgFilter = { organizationId: context.orgId || undefined };

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
        // Return demo data on any error
        return NextResponse.json({ ...DEMO_ANALYTICS, error: safeError(error).message });
    }
}
