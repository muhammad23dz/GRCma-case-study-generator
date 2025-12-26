import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const whereClause: any = {};
        if (process.env.DEV_MODE !== 'true' && orgId) {
            whereClause.organizationId = orgId;
        }

        const [total, pending, approved, expiring] = await Promise.all([
            prisma.evidence.count({ where: whereClause }),
            prisma.evidence.count({ where: { ...whereClause, status: 'under_review' } }),
            prisma.evidence.count({ where: { ...whereClause, status: 'approved' } }),
            prisma.evidence.count({
                where: {
                    ...whereClause,
                    status: 'approved',
                    // Logic for expiring evidence (e.g. within next 30 days)
                    // This is placeholder logic as 'expiresAt' might not be in basic schema
                    // Depending on how we define expiration in Gigachad
                }
            }),
        ]);

        return NextResponse.json({
            total,
            pending,
            approved,
            expiring,
            // Additional counts for the Dashboard UI
            pendingReview: pending,
            expiringSoon: expiring,
            expired: 0 // Placeholder
        });
    } catch (error: any) {
        console.error('Error fetching evidence stats:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
