import { NextRequest, NextResponse } from 'next/server';
import { analyzeIncident } from '@/lib/ai/grc-intelligence';
import { IncidentAnalysisRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';
import { getIsolationContext } from '@/lib/isolation';

/**
 * POST /api/ai/analyze-incident
 * AI-powered incident analysis with root cause and remediation
 */
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Infrastructure context required.' }, { status: 401 });
        }

        const body: IncidentAnalysisRequest = await request.json();

        if (!body.title || !body.description) {
            return NextResponse.json(
                { error: 'title and description are required' },
                { status: 400 }
            );
        }

        const analysis = await analyzeIncident(body);

        return NextResponse.json({
            success: true,
            analysis,
        });
    } catch (error: unknown) {
        console.error('AI Incident Analysis error:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
