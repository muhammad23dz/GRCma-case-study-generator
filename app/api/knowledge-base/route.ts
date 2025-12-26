import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { logAudit } from '@/lib/audit-log';
import { z } from 'zod';

// Input Validation
const createEntrySchema = z.object({
    question: z.string().min(10).max(1000),
    answer: z.string().min(20).max(10000),
    category: z.enum(['security', 'privacy', 'compliance', 'infrastructure', 'governance', 'data_protection', 'access_control', 'incident_response', 'vendor', 'other']),
    tags: z.array(z.string().max(50)).max(10).default([]),
    controlId: z.string().cuid().optional(),
    policyId: z.string().cuid().optional(),
    frameworkId: z.string().cuid().optional(),
    confidenceScore: z.number().min(0).max(1).optional()
});

const updateEntrySchema = z.object({
    question: z.string().min(10).max(1000).optional(),
    answer: z.string().min(20).max(10000).optional(),
    category: z.enum(['security', 'privacy', 'compliance', 'infrastructure', 'governance', 'data_protection', 'access_control', 'incident_response', 'vendor', 'other']).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    status: z.enum(['draft', 'approved', 'archived']).optional()
});

// GET /api/knowledge-base - Search/list knowledge base entries
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('q');
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const tag = searchParams.get('tag');

        const whereClause: any = {
            organizationId: context.orgId || undefined
        };

        if (category) whereClause.category = category;
        if (status) whereClause.status = status;
        if (tag) whereClause.tags = { has: tag };

        // Text search if query provided
        if (search) {
            whereClause.OR = [
                { question: { contains: search, mode: 'insensitive' } },
                { answer: { contains: search, mode: 'insensitive' } }
            ];
        }

        const entries = await prisma.knowledgeBaseEntry.findMany({
            where: whereClause,
            orderBy: [
                { usageCount: 'desc' },
                { updatedAt: 'desc' }
            ],
            take: 100
        });

        // Get category stats
        const categoryStats = await prisma.knowledgeBaseEntry.groupBy({
            by: ['category'],
            where: { organizationId: context.orgId || undefined },
            _count: true
        });

        // Get all unique tags
        const allEntries = await prisma.knowledgeBaseEntry.findMany({
            where: { organizationId: context.orgId || undefined },
            select: { tags: true }
        });
        const allTags = [...new Set(allEntries.flatMap(e => e.tags))];

        return NextResponse.json({
            entries,
            stats: {
                total: entries.length,
                byCategory: categoryStats,
                tags: allTags
            }
        });
    } catch (error: any) {
        const { message, status } = safeError(error, 'KnowledgeBase GET');
        return NextResponse.json({ error: message }, { status });
    }
}

// POST /api/knowledge-base - Create new knowledge base entry
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const parseResult = createEntrySchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const data = parseResult.data;

        const entry = await prisma.knowledgeBaseEntry.create({
            data: {
                ...data,
                owner: context.email,
                organizationId: context.orgId || undefined,
                status: 'draft'
            }
        });

        await logAudit({
            entity: 'KnowledgeBaseEntry',
            entityId: entry.id,
            action: 'CREATE',
            changes: { question: entry.question.substring(0, 100), category: entry.category }
        });

        return NextResponse.json({ entry }, { status: 201 });
    } catch (error: any) {
        const { message, status } = safeError(error, 'KnowledgeBase POST');
        return NextResponse.json({ error: message }, { status });
    }
}

// PATCH /api/knowledge-base?id=xxx - Update entry
export async function PATCH(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        const body = await request.json();

        const parseResult = updateEntrySchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        // Verify entry belongs to org
        const existing = await prisma.knowledgeBaseEntry.findFirst({
            where: { id, organizationId: context.orgId || undefined }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        const updateData: any = { ...parseResult.data };

        // Handle approval
        if (parseResult.data.status === 'approved' && existing.status !== 'approved') {
            updateData.approvedBy = context.email;
            updateData.approvedAt = new Date();
            updateData.version = existing.version + 1;
        }

        const entry = await prisma.knowledgeBaseEntry.update({
            where: { id },
            data: updateData
        });

        await logAudit({
            entity: 'KnowledgeBaseEntry',
            entityId: id,
            action: 'UPDATE',
            changes: parseResult.data
        });

        return NextResponse.json({ entry });
    } catch (error: any) {
        const { message, status } = safeError(error, 'KnowledgeBase PATCH');
        return NextResponse.json({ error: message }, { status });
    }
}

// DELETE /api/knowledge-base?id=xxx - Archive/delete entry
export async function DELETE(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        // Verify entry belongs to org
        const existing = await prisma.knowledgeBaseEntry.findFirst({
            where: { id, organizationId: context.orgId || undefined }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
        }

        // Soft delete (archive)
        await prisma.knowledgeBaseEntry.update({
            where: { id },
            data: { status: 'archived' }
        });

        await logAudit({
            entity: 'KnowledgeBaseEntry',
            entityId: id,
            action: 'DELETE',
            changes: { archived: true }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        const { message, status } = safeError(error, 'KnowledgeBase DELETE');
        return NextResponse.json({ error: message }, { status });
    }
}
