import { NextRequest, NextResponse } from 'next/server';
import { PredictiveService } from '@/lib/analytics/predictive';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

const predictiveService = new PredictiveService();

// GET /api/analytics/predictive/[riskId]
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ riskId: string }> }
) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const { riskId } = await params;
        if (!riskId) {
            return NextResponse.json({ error: 'Risk ID is required' }, { status: 400 });
        }

        const forecast = await predictiveService.forecastRisk(riskId, context.orgId);

        if (!forecast) {
            return NextResponse.json({ error: 'Risk not found or inaccessible.' }, { status: 404 });
        }

        return NextResponse.json(forecast);
    } catch (error) {
        console.error('Error generating forecast:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
