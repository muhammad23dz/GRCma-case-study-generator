import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeRisk } from '@/lib/ai/grc-intelligence';
import { RiskScoringRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';

/**
 * POST /api/ai/analyze-risk
 * AI-powered risk analysis with likelihood/impact scoring
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: RiskScoringRequest = await request.json();

        if (!body.title || !body.description) {
            return NextResponse.json(
                { error: 'Title and description are required' },
                { status: 400 }
            );
        }

        const analysis = await analyzeRisk(body);

        return NextResponse.json({
            success: true,
            analysis,
        });
    } catch (error: unknown) {
        console.error('AI Risk Analysis error:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
