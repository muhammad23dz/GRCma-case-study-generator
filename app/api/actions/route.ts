import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';
import { z } from 'zod';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// Input Validation Schema
const createActionSchema = z.object({
    type: z.string().min(1, "Type is required"),
    title: z.string().min(3, "Title too short").max(200),
    description: z.string(),
    controlId: z.string().optional(),
    incidentId: z.string().optional(),
    riskId: z.string().optional(),
    severity: z.string().optional(),
    assignee: z.string().email("Assignee must be a valid email").optional(),
    dueDate: z.string().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    generatePlaybook: z.boolean().optional()
});

// GET /api/actions - List actions for current user
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        // Expert Tier Isolation
        const where: any = {
            ...getIsolationFilter(context, 'Action')
        };

        if (status) where.status = status;
        if (priority) where.priority = priority;

        const actions = await prisma.action.findMany({
            where,
            include: {
                control: true,
                incident: true,
                risk: true
            },
            take: 100,
            orderBy: [
                { priority: 'desc' },
                { dueDate: 'asc' }
            ]
        });

        const mappedActions = actions.map(a => ({
            ...a,
            assignee: a.assignedTo
        }));

        return NextResponse.json({ actions: mappedActions });
    } catch (error: any) {
        const { message, status, code } = safeError(error, 'Actions GET API');
        return NextResponse.json({ error: message, code }, { status });
    }
}

// POST /api/actions - Create new action with GRC relations
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedInput = createActionSchema.parse(body);

        const action = await prisma.action.create({
            data: {
                type: validatedInput.type,
                title: validatedInput.title,
                description: validatedInput.description,
                status: 'open',
                owner: context.email,
                organizationId: context.orgId || undefined, // Org-scoped IAM support
                assignedTo: validatedInput.assignee || context.email,
                dueDate: validatedInput.dueDate ? new Date(validatedInput.dueDate) : null,
                priority: validatedInput.priority,
                // GRC Relations
                controlId: validatedInput.controlId || null,
                incidentId: validatedInput.incidentId || null,
                riskId: validatedInput.riskId || null
            },
            include: {
                control: true,
                incident: true,
                risk: true
            }
        });

        // Generate AI playbook if requested
        if (validatedInput.generatePlaybook && action.title) {
            try {
                const playbook = await grcLLM.generatePlaybook(
                    action.title,
                    validatedInput.severity || 'medium'
                );
                await prisma.action.update({
                    where: { id: action.id },
                    data: { playbook: playbook.data as any }
                });
            } catch (e) {
                console.error('[Actions] Playbook generation failed:', e);
            }
        }

        return NextResponse.json({ action }, { status: 201 });
    } catch (error: any) {
        const { message, status, code } = safeError(error, 'Actions POST API');
        return NextResponse.json({ error: message, code }, { status });
    }
}
