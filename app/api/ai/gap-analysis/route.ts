import { NextRequest, NextResponse } from 'next/server';
import { analyzeComplianceGaps } from '@/lib/ai/grc-intelligence';
import { GapAnalysisRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';
import { getIsolationContext } from '@/lib/isolation';

/**
 * POST /api/ai/gap-analysis
 * AI-powered compliance gap analysis against frameworks
 */
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Infrastructure context required.' }, { status: 401 });
        }

        const body: GapAnalysisRequest = await request.json();

        if (!body.framework || !body.currentControls) {
            return NextResponse.json(
                { error: 'framework and currentControls are required' },
                { status: 400 }
            );
        }

        const analysis = await analyzeComplianceGaps(body);

        return NextResponse.json({
            success: true,
            analysis,
        });
    } catch (error: unknown) {
        console.error('AI Gap Analysis error:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
