import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

export async function GET(request: Request) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const orgId = context.orgId;

        const [total, pending, approved, expiring] = await Promise.all([
            prisma.evidence.count({ where: { organizationId: orgId } }),
            prisma.evidence.count({ where: { organizationId: orgId, status: 'under_review' } }),
            prisma.evidence.count({ where: { organizationId: orgId, status: 'approved' } }),
            prisma.evidence.count({
                where: {
                    organizationId: orgId,
                    status: 'approved',
                    nextReviewDate: {
                        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
                    }
                }
            }),
        ]);

        return NextResponse.json({
            total,
            pending,
            approved,
            expiring,
            pendingReview: pending,
            expiringSoon: expiring,
            expired: 0 // Placeholder for future logic
        });
    } catch (error: any) {
        const { message, status, code } = safeError(error, 'Evidence Stats');
        return NextResponse.json({ error: message, code }, { status });
    }
}
