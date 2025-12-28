import { NextRequest, NextResponse } from 'next/server';
import { analyzeRisk } from '@/lib/ai/grc-intelligence';
import { RiskScoringRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';
import { getIsolationContext } from '@/lib/isolation';

/**
 * POST /api/ai/analyze-risk
 * AI-powered risk analysis with likelihood/impact scoring
 */
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Infrastructure context required.' }, { status: 401 });
        }

        const body: RiskScoringRequest = await request.json();

        if (!body.title || !body.description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            );
        }

        // Pass organization context if the AI service is updated to use it
        const analysis = await analyzeRisk({
            ...body,
            industryContext: body.industryContext || 'General'
        });

        return NextResponse.json({
            success: true,
            analysis,
        });
    } catch (error: unknown) {
        console.error('AI Risk Analysis error:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
