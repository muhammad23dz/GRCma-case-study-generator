import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET /api/analytics/activity - Get recent audit activity
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const logs = await prisma.auditLog.findMany({
            take: 10,
            orderBy: { timestamp: 'desc' },
            select: {
                id: true,
                userName: true,
                userEmail: true,
                action: true,
                entity: true,
                entityId: true,
                timestamp: true,
                changes: true
            }
        });

        return NextResponse.json({ logs });
    } catch (error: any) {
        console.error('Error fetching activity:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
