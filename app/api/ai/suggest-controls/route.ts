import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { suggestControls } from '@/lib/ai/grc-intelligence';
import { ControlSuggestionRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';

/**
 * POST /api/ai/suggest-controls
 * AI-powered control recommendations based on risks/frameworks
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: ControlSuggestionRequest = await request.json();

        // At least one context field required
        if (!body.riskDescription && !body.framework && !body.frameworkRequirement) {
            return NextResponse.json(
                { error: 'At least one of riskDescription, framework, or frameworkRequirement is required' },
                { status: 400 }
            );
        }

        const suggestions = await suggestControls(body);

        return NextResponse.json({
            success: true,
            suggestions,
        });
    } catch (error: unknown) {
        console.error('AI Control Suggestions error:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
