import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/risks/reports - Generate Risk Reports
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const reportType = searchParams.get('type') || 'executive';

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        // Fetch all risks with relations
        const risks = await prisma.risk.findMany({
            where: { owner: userEmail },
            include: {
                control: true,
                riskControls: { include: { control: true } },
                vendorRisks: { include: { vendor: true } },
                assetRisks: { include: { asset: true } },
                history: { orderBy: { recordedAt: 'desc' }, take: 30 }
            }
        });

        // Calculate metrics
        const totalRisks = risks.length;
        const criticalRisks = risks.filter(r => r.score >= 15);
        const highRisks = risks.filter(r => r.score >= 10 && r.score < 15);
        const mediumRisks = risks.filter(r => r.score >= 5 && r.score < 10);
        const lowRisks = risks.filter(r => r.score < 5);

        const openRisks = risks.filter(r => r.status === 'open');
        const mitigatedRisks = risks.filter(r => r.status === 'mitigated');
        const acceptedRisks = risks.filter(r => r.status === 'accepted');

        // Category breakdown
        const categoryBreakdown = risks.reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Trend data (from history)
        const trendData = risks.flatMap(r => r.history || []).reduce((acc, h) => {
            const date = new Date(h.recordedAt).toISOString().split('T')[0];
            if (!acc[date]) acc[date] = { count: 0, totalScore: 0 };
            acc[date].count++;
            acc[date].totalScore += h.score;
            return acc;
        }, {} as Record<string, { count: number; totalScore: number }>);

        // Top risks
        const topRisks = risks
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(r => ({
                id: r.id,
                category: r.category,
                narrative: r.narrative.substring(0, 100) + '...',
                score: r.score,
                status: r.status,
                controlCount: r.riskControls?.length || 0
            }));

        // Build report
        const report = {
            generatedAt: new Date().toISOString(),
            reportType,
            summary: {
                totalRisks,
                averageScore: totalRisks > 0 ? Math.round(risks.reduce((a, r) => a + r.score, 0) / totalRisks * 10) / 10 : 0,
                riskExposure: criticalRisks.length * 5 + highRisks.length * 3 + mediumRisks.length,
            },
            distribution: {
                bySeverity: {
                    critical: criticalRisks.length,
                    high: highRisks.length,
                    medium: mediumRisks.length,
                    low: lowRisks.length
                },
                byStatus: {
                    open: openRisks.length,
                    mitigated: mitigatedRisks.length,
                    accepted: acceptedRisks.length
                },
                byCategory: categoryBreakdown
            },
            topRisks,
            trends: Object.entries(trendData).map(([date, data]) => ({
                date,
                averageScore: Math.round(data.totalScore / data.count * 10) / 10
            })).sort((a, b) => a.date.localeCompare(b.date)),
            recommendations: [
                criticalRisks.length > 0 && `${criticalRisks.length} critical risks require immediate attention`,
                openRisks.length > totalRisks * 0.5 && `${Math.round(openRisks.length / totalRisks * 100)}% of risks are still open`,
                risks.filter(r => (r.riskControls?.length || 0) === 0).length > 0 &&
                `${risks.filter(r => (r.riskControls?.length || 0) === 0).length} risks have no linked controls`
            ].filter(Boolean)
        };

        return NextResponse.json({ report });
    } catch (error: any) {
        console.error('Error generating risk report:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
