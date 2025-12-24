import { NextRequest, NextResponse } from 'next/server';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { generateKBFromGRC } from '@/lib/grc-automation';

// POST /api/knowledge-base/generate - Auto-generate KB entries from GRC data
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Run GRC automation to generate KB entries
        const result = await generateKBFromGRC(context.orgId!, context.email);

        return NextResponse.json({
            success: true,
            message: `Generated ${result.created} Knowledge Base entries from GRC data`,
            created: result.created
        });
    } catch (error: any) {
        const { message, status } = safeError(error, 'KnowledgeBase Generate');
        return NextResponse.json({ error: message }, { status });
    }
}
