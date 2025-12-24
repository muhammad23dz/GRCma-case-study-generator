import { NextRequest, NextResponse } from 'next/server';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { findKBMatch } from '@/lib/grc-automation';

// POST /api/knowledge-base/suggest - Find matching KB entry for a question
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { question } = body;

        if (!question || typeof question !== 'string') {
            return NextResponse.json({ error: 'question required' }, { status: 400 });
        }

        // Find best match using GRC automation
        const match = await findKBMatch(question, context.orgId!);

        if (!match) {
            return NextResponse.json({
                found: false,
                message: 'No matching entry found'
            });
        }

        return NextResponse.json({
            found: true,
            confidence: match.confidence,
            entry: {
                id: match.entry.id,
                question: match.entry.question,
                answer: match.entry.answer,
                category: match.entry.category,
                tags: match.entry.tags
            }
        });
    } catch (error: any) {
        const { message, status } = safeError(error, 'KnowledgeBase Suggest');
        return NextResponse.json({ error: message }, { status });
    }
}
