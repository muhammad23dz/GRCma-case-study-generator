import { NextRequest, NextResponse } from 'next/server';
import { PredictiveService } from '@/lib/analytics/predictive';
import { auth } from '@clerk/nextjs/server';

const predictiveService = new PredictiveService();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ riskId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { riskId } = await params;
        if (!riskId) {
            return NextResponse.json({ error: 'Risk ID is required' }, { status: 400 });
        }

        const forecast = await predictiveService.forecastRisk(riskId);

        if (!forecast) {
            return NextResponse.json({ error: 'Risk not found or insufficient data' }, { status: 404 });
        }

        return NextResponse.json(forecast);
    } catch (error) {
        console.error('Error generating forecast:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
