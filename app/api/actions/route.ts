import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';

// GET /api/actions - List all actions
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            console.log("No session found in GET /api/actions");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const assignee = searchParams.get('assignee');
        const priority = searchParams.get('priority');

        console.log(`Fetching actions for user: ${session.user.email}`);

        const where: any = {};
        where.owner = session.user.email;

        if (status) where.status = status;
        if (assignee) where.assignedTo = assignee; // Map input 'assignee' to DB 'assignedTo'
        if (priority) where.priority = priority;

        const actions = await prisma.action.findMany({
            where,
            include: {
                control: true,
                incident: true,
            },
            take: 50, // Limit results for performance
            orderBy: [
                { priority: 'desc' }, // Switched from severity to priority
                { dueDate: 'asc' }
            ]
        });

        // Map DB 'assignedTo' back to 'assignee' for frontend
        const mappedActions = actions.map(a => ({
            ...a,
            assignee: a.assignedTo
        }));

        return NextResponse.json({ actions: mappedActions });
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
                assignedTo: assignee, // Map input 'assignee' to DB 'assignedTo'
                dueDate: dueDate ? new Date(dueDate) : null,
                priority: priority || 'medium',
                // severity, // REMOVED: Schema does not have severity field
                playbook,
                status: 'open'
            }
        });

        return NextResponse.json({ action: { ...action, assignee: action.assignedTo } });
    } catch (error: any) {
        console.error("Detailed API Error in POST /api/actions:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
