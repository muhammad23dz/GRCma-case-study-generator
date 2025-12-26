import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { logAudit } from '@/lib/audit-log';
import { z } from 'zod';

// Input Validation
const createRequestSchema = z.object({
    auditId: z.string().cuid(),
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(5000),
    category: z.enum(['control_documentation', 'policy_review', 'evidence', 'interview', 'system_access', 'walkthrough']),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    assignedTo: z.string().email().optional(),
    dueDate: z.string().optional(),
    controlId: z.string().cuid().optional(),
    requirementId: z.string().optional()
});

const updateRequestSchema = z.object({
    status: z.enum(['open', 'in_progress', 'submitted', 'under_review', 'approved', 'rejected']).optional(),
    notes: z.string().max(5000).optional(),
    assignedTo: z.string().email().optional(),
    auditorComments: z.string().max(5000).optional()
});

// GET /api/audit-requests - List audit requests
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const auditId = searchParams.get('auditId');
        const status = searchParams.get('status');
        const assignedTo = searchParams.get('assignedTo');

        const whereClause: any = {
            organizationId: context.orgId
        };

        if (auditId) whereClause.auditId = auditId;
        if (status) whereClause.status = status;
        if (assignedTo) whereClause.assignedTo = assignedTo;

        const requests = await prisma.auditRequest.findMany({
            where: whereClause,
            include: {
                audit: { select: { title: true, framework: true } },
                attachments: true,
                _count: { select: { attachments: true } }
            },
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' }
            ]
        });

        // Get stats
        const stats = await prisma.auditRequest.groupBy({
            by: ['status'],
            where: { organizationId: context.orgId },
            _count: true
        });

        return NextResponse.json({ requests, stats });
    } catch (error: any) {
        const { message, status } = safeError(error, 'AuditRequests GET');
        return NextResponse.json({ error: message }, { status });
    }
}

// POST /api/audit-requests - Create new audit request
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const parseResult = createRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { auditId, title, description, category, priority, assignedTo, dueDate, controlId, requirementId } = parseResult.data;

        // Verify audit belongs to org
        const audit = await prisma.audit.findFirst({
            where: { id: auditId, organizationId: context.orgId }
        });

        if (!audit) {
            return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
        }

        const auditRequest = await prisma.auditRequest.create({
            data: {
                auditId,
                title,
                description,
                category,
                priority,
                assignedTo,
                dueDate: dueDate ? new Date(dueDate) : null,
                controlId,
                requirementId,
                organizationId: context.orgId
            }
        });

        await logAudit({
            entity: 'AuditRequest',
            entityId: auditRequest.id,
            action: 'CREATE',
            changes: { title, category, priority }
        });

        return NextResponse.json({ auditRequest }, { status: 201 });
    } catch (error: any) {
        const { message, status } = safeError(error, 'AuditRequests POST');
        return NextResponse.json({ error: message }, { status });
    }
}

// PATCH /api/audit-requests - Update audit request status
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

        const parseResult = updateRequestSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        // Verify request belongs to org
        const existing = await prisma.auditRequest.findFirst({
            where: { id, organizationId: context.orgId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        const updateData: any = { ...parseResult.data };

        // Track status transitions
        if (parseResult.data.status === 'submitted' && existing.status !== 'submitted') {
            updateData.submittedAt = new Date();
        }
        if (['approved', 'rejected'].includes(parseResult.data.status || '') && !['approved', 'rejected'].includes(existing.status)) {
            updateData.reviewedAt = new Date();
            updateData.reviewedBy = context.email;
        }

        const auditRequest = await prisma.auditRequest.update({
            where: { id },
            data: updateData
        });

        await logAudit({
            entity: 'AuditRequest',
            entityId: id,
            action: 'UPDATE',
            changes: parseResult.data
        });

        // GRC Automation: Update audit progress when request status changes
        if (parseResult.data.status && ['submitted', 'approved', 'rejected'].includes(parseResult.data.status)) {
            try {
                const { updateAuditProgress } = await import('@/lib/grc-automation');
                const progressResult = await updateAuditProgress(existing.auditId);
                console.log(`[GRC Automation] Audit progress updated: ${progressResult.progress}% complete`);
            } catch (automationError) {
                console.error('[GRC Automation] Failed to update audit progress:', automationError);
                // Non-blocking - don't fail the request
            }
        }

        return NextResponse.json({ auditRequest });
    } catch (error: any) {
        const { message, status } = safeError(error, 'AuditRequests PATCH');
        return NextResponse.json({ error: message }, { status });
    }
}
