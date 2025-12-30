import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { analyzeRisk } from '@/lib/ai/grc-intelligence';
import { RiskScoringRequest } from '@/lib/ai/types';
import { isLLMAvailable } from '@/lib/llm/llm-service';

/**
 * POST /api/ai/analyze-risk
 * AI-powered risk analysis with likelihood/impact scoring
 * Database-independent: uses Clerk auth directly
 */
export async function POST(request: NextRequest) {
    console.log('[Risk Analysis] Starting analysis...');

    try {
        // Step 1: Authenticate via Clerk directly (no database required)
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            return NextResponse.json({
                error: 'Please sign in to analyze risks.',
                code: 'AUTH_REQUIRED'
            }, { status: 401 });
        }

        const user = await currentUser();
        console.log('[Risk Analysis] Authenticated as:', user?.primaryEmailAddress?.emailAddress);

        // Step 2: Check LLM availability
        if (!isLLMAvailable()) {
            return NextResponse.json({
                error: 'AI service is not configured. Please contact the administrator.',
                code: 'LLM_NOT_CONFIGURED'
            }, { status: 503 });
        }

        // Step 3: Parse and validate request
        let body: RiskScoringRequest;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({
                error: 'Invalid request body. Please provide valid JSON.',
                code: 'INVALID_REQUEST'
            }, { status: 400 });
        }

        if (!body.title || !body.description) {
            return NextResponse.json({
                error: 'Risk title and description are required.',
                code: 'MISSING_FIELDS'
            }, { status: 400 });
        }

        console.log('[Risk Analysis] Analyzing risk:', body.title);

        // Step 4: Call AI analysis
        const analysis = await analyzeRisk({
            ...body,
            industryContext: body.industryContext || 'General'
        });

        console.log('[Risk Analysis] Analysis complete - Risk Level:', analysis.riskLevel);

        return NextResponse.json({
            success: true,
            analysis,
        });

    } catch (error: any) {
        console.error('[Risk Analysis] Error:', error);

        // Provide user-friendly error messages
        const errorMsg = error.message || String(error);
        let userMessage = 'Risk analysis failed. Please try again.';
        let errorCode = 'ANALYSIS_FAILED';
        let status = 500;

        if (errorMsg.includes('API key') || errorMsg.includes('Critical Configuration')) {
            userMessage = 'AI service is not properly configured.';
            errorCode = 'LLM_NOT_CONFIGURED';
            status = 503;
        } else if (errorMsg.includes('parse') || errorMsg.includes('JSON')) {
            userMessage = 'AI returned an invalid response. Please try again.';
            errorCode = 'AI_PARSE_ERROR';
            status = 502;
        } else if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT')) {
            userMessage = 'AI service timed out. Please try again.';
            errorCode = 'AI_TIMEOUT';
            status = 504;
        }

        return NextResponse.json({ error: userMessage, code: errorCode }, { status });
    }
}
