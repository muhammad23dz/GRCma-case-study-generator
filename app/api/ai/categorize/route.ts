import { NextRequest, NextResponse } from 'next/server';
import { categorizeEntity } from '@/lib/ai/grc-intelligence';
import { CategorizationRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';
import { getIsolationContext } from '@/lib/isolation';

/**
 * POST /api/ai/categorize
 * AI-powered auto-categorization for GRC entities
 */
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Infrastructure context required.' }, { status: 401 });
        }

        const body: CategorizationRequest = await request.json();

        if (!body.entityType || !body.title || !body.description) {
            return NextResponse.json(
                { error: 'entityType, title, and description are required' },
                { status: 400 }
            );
        }

        const categorization = await categorizeEntity(body);

        return NextResponse.json({
            success: true,
            categorization,
        });
    } catch (error: unknown) {
        console.error('AI Categorization error:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
