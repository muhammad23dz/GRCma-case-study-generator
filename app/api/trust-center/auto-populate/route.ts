import { NextRequest, NextResponse } from 'next/server';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { populateTrustCenterFromGRC } from '@/lib/grc-automation';
import { prisma } from '@/lib/prisma';

// POST /api/trust-center/auto-populate - Auto-populate from GRC data
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required' }, { status: 401 });
        }

        // Get trust center config
        const config = await prisma.trustCenterConfig.findUnique({
            where: { organizationId: context.orgId! }
        });

        if (!config) {
            return NextResponse.json({ error: 'Trust center not configured. Create a config first.' }, { status: 404 });
        }

        // Run GRC automation to populate sections
        const stats = await populateTrustCenterFromGRC(config.id, context.orgId!);

        return NextResponse.json({
            success: true,
            message: 'Trust Center populated from GRC data',
            stats
        });
    } catch (error: any) {
        const { message, status } = safeError(error, 'TrustCenter AutoPopulate');
        return NextResponse.json({ error: message }, { status });
    }
}
