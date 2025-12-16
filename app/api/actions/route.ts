import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';
import { z } from 'zod';

const DEV_MODE = process.env.DEV_MODE === 'true';

// Strict Input Validation Schema
const createActionSchema = z.object({
    type: z.string().min(1, "Type is required"),
    title: z.string().min(3, "Title too short").max(200),
    description: z.string(),
    controlId: z.string().optional(),
    incidentId: z.string().optional(),
    severity: z.string().optional(),
    assignee: z.string().email("Assignee must be a valid email").optional(),
    dueDate: z.string().datetime().optional().nullable(),
    priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    generatePlaybook: z.boolean().optional()
});

// GET /api/actions - List all actions
export async function GET(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true, role: true } });
        const userEmail = dbUser?.email || '';
        const userRole = dbUser?.role || 'user';

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const assignee = searchParams.get('assignee');
        const priority = searchParams.get('priority');
        const isAdmin = ['admin', 'manager'].includes(userRole);

        const where: any = {};

        if (DEV_MODE) {
            // Show all actions in dev mode
        } else if (orgId) {
            where.organizationId = orgId;
            if (!isAdmin) {
                where.owner = userEmail;
            }
        } else {
            where.owner = userEmail;
        }

        if (status) where.status = status;
        if (assignee) {
            if (!assignee.includes('@')) return NextResponse.json({ error: "Invalid assignee format" }, { status: 400 });
            where.assignedTo = assignee;
        }
        if (priority) where.priority = priority;

        const actions = await prisma.action.findMany({
            where,
            include: {
                control: true,
                incident: true,
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
        console.error("Error in GET /api/actions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/actions - Create action with LLM playbook
export async function POST(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true } });
        const userEmail = dbUser?.email || '';

        const body = await request.json();
        const validation = createActionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Validation Failed',
                details: validation.error.issues
            }, { status: 400 });
        }

        const { type, title, description, controlId, incidentId, severity, assignee, dueDate, priority, generatePlaybook } = validation.data;

        let playbook = null;
        if (generatePlaybook) {
            try {
                const result = await grcLLM.generatePlaybook(description, severity || 'medium');
                playbook = JSON.stringify(result.data);
            } catch (e) {
                console.error("Playbook generation failed:", e);
            }
        }

        const action = await prisma.action.create({
            data: {
                type,
                title,
                description,
                controlId,
                incidentId,
                owner: userEmail,
                assignedTo: assignee,
                dueDate: dueDate ? new Date(dueDate) : null,
                priority: priority as any,
                playbook: playbook ? JSON.parse(playbook) : undefined,
                status: 'open',
                organizationId: orgId || null,
            }
        });

        return NextResponse.json({ action: { ...action, assignee: action.assignedTo } });
    } catch (error: any) {
        console.error("Error in POST /api/actions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
