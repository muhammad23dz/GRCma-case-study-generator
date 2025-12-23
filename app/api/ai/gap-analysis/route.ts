import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeComplianceGaps } from '@/lib/ai/grc-intelligence';
import { GapAnalysisRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';

/**
 * POST /api/ai/gap-analysis
 * AI-powered compliance gap analysis against frameworks
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
