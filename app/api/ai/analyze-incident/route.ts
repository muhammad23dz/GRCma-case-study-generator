import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzeIncident } from '@/lib/ai/grc-intelligence';
import { IncidentAnalysisRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';

/**
 * POST /api/ai/analyze-incident
 * AI-powered incident analysis with root cause and remediation
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
