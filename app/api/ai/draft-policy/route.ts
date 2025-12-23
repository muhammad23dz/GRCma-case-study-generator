import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { draftPolicy } from '@/lib/ai/grc-intelligence';
import { PolicyDraftRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';

/**
 * POST /api/ai/draft-policy
 * AI-powered policy document generation
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body: PolicyDraftRequest = await request.json();

        if (!body.policyType || !body.organizationName) {
            return NextResponse.json(
                { error: 'policyType and organizationName are required' },
                { status: 400 }
            );
        }

        const policy = await draftPolicy(body);

        return NextResponse.json({
            success: true,
            policy,
        });
    } catch (error: unknown) {
        console.error('AI Policy Drafting error:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
