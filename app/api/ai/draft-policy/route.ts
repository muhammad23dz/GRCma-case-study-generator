import { NextRequest, NextResponse } from 'next/server';
import { draftPolicy } from '@/lib/ai/grc-intelligence';
import { PolicyDraftRequest } from '@/lib/ai/types';
import { safeError } from '@/lib/security';
import { getIsolationContext } from '@/lib/isolation';

/**
 * POST /api/ai/draft-policy
 * AI-powered policy document generation
 */
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Infrastructure context required.' }, { status: 401 });
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
