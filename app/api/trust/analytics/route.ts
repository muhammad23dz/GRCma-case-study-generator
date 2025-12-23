import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/trust/analytics - Trust Center Analytics
export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get trust requests over time
        const trustRequests = await prisma.trustRequest.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        // Group by date
        const requestsByDate = trustRequests.reduce((acc, req) => {
            const date = new Date(req.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Group by company
        const requestsByCompany = trustRequests.reduce((acc, req) => {
            const company = req.company || 'Unknown';
            acc[company] = (acc[company] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Group by reason
        const requestsByReason = trustRequests.reduce((acc, req) => {
            const reason = req.reason || 'Not specified';
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Status breakdown
        const statusBreakdown = {
            pending: trustRequests.filter(r => r.status === 'pending').length,
            approved: trustRequests.filter(r => r.status === 'approved').length,
            rejected: trustRequests.filter(r => r.status === 'rejected').length
        };

        // Get framework coverage trends
        const frameworks = await prisma.framework.findMany({
            include: {
                requirements: true,
                mappings: true
            }
        });

        const frameworkTrends = frameworks.map(fw => ({
            name: fw.name,
            coverage: fw.requirements.length > 0
                ? Math.round(fw.mappings.length / fw.requirements.length * 100)
                : 0,
            totalRequirements: fw.requirements.length,
            mappedControls: fw.mappings.length
        }));

        return NextResponse.json({
            analytics: {
                summary: {
                    totalRequests: trustRequests.length,
                    pendingRequests: statusBreakdown.pending,
                    approvalRate: trustRequests.length > 0
                        ? Math.round(statusBreakdown.approved / trustRequests.length * 100)
                        : 0,
                    uniqueCompanies: Object.keys(requestsByCompany).length
                },
                trends: {
                    byDate: Object.entries(requestsByDate)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .slice(-30)
                        .map(([date, count]) => ({ date, count })),
                    byCompany: Object.entries(requestsByCompany)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 10)
                        .map(([company, count]) => ({ company, count })),
                    byReason: Object.entries(requestsByReason)
                        .map(([reason, count]) => ({ reason, count }))
                },
                status: statusBreakdown,
                frameworkCoverage: frameworkTrends
            }
        });
    } catch (error: any) {
        console.error('Error fetching trust analytics:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
