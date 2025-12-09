import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';

// GET /api/actions - List all actions
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        // Allow unauthenticated access for now if session fails, but improved for prod
        // logical fix: if no session, just return empty or error, but let's log it
        if (!session?.user?.email) {
            console.log("No session found in GET /api/actions");
            // For debugging: return 401 but with JSON
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const assignee = searchParams.get('assignee');
        const priority = searchParams.get('priority');

        console.log(`Fetching actions for user: ${session.user.email}`);

        // Construct where clause dynamically
        const where: any = {};

        // Only valid if 'owner' exists on Action model. Check schema.
        // If owner is nullable or not used, remove this.
        where.owner = session.user.email;

        if (status) where.status = status;
        if (assignee) where.assignee = assignee;
        if (priority) where.priority = priority;

        const actions = await prisma.action.findMany({
            where,
            include: {
                control: true,
                incident: true,
                comments: {
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: [
                { severity: 'desc' },
                { dueDate: 'asc' }
            ]
        });

        return NextResponse.json({ actions });
    } catch (error: any) {
        console.error("Detailed API Error in GET /api/actions:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

// POST /api/actions - Create action with LLM playbook
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, title, description, controlId, incidentId, severity, assignee, dueDate, priority, generatePlaybook } = body;

        let playbook = null;
        if (generatePlaybook) {
            const result = await grcLLM.generatePlaybook(description, severity);
            playbook = JSON.stringify(result.data);
        }

        const action = await prisma.action.create({
            data: {
                type,
                title,
                description,
                controlId,
                incidentId,
                owner: session.user.email!,
                assignee,
                dueDate: dueDate ? new Date(dueDate) : null,
                priority: priority || 'medium',
                severity,
                playbook,
                status: 'open'
            }
        });

        return NextResponse.json({ action });
    } catch (error: any) {
        console.error("Detailed API Error in POST /api/actions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
