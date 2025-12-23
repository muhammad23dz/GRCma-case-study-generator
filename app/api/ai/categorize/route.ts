import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { categorizeEntity } from '@/lib/ai/grc-intelligence';
import { CategorizationRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';

/**
 * POST /api/ai/categorize
 * AI-powered auto-categorization for GRC entities
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
