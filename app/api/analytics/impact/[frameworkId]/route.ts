import { NextRequest, NextResponse } from 'next/server';
import { ImpactService } from '@/lib/analytics/impact';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

const impactService = new ImpactService();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ frameworkId: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const { frameworkId } = await params;
        if (!frameworkId) {
            return NextResponse.json({ error: 'Framework ID is required' }, { status: 400 });
        }

        const impact = await impactService.analyzeFrameworkImpact(frameworkId, context.orgId);

        if (!impact) {
            return NextResponse.json({ error: 'Framework not found or inaccessible.' }, { status: 404 });
        }

        return NextResponse.json(impact);
    } catch (error) {
        const { message, status, code } = safeError(error, 'Impact Analytics');
        return NextResponse.json({ error: message, code }, { status });
    }
}
