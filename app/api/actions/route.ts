import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';

// GET /api/actions - List all actions
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const assignee = searchParams.get('assignee');
        const priority = searchParams.get('priority');

        // Multi-tenancy enforcement: Restrict to user's own actions
        const actions = await prisma.action.findMany({
            where: {
                owner: session.user.email, // Strict ownership check
                ...(status && { status }),
                ...(assignee && { assignee }),
                ...(priority && { priority }),
            },
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/actions - Create action with LLM playbook
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
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
                owner: session.user.email!, // Enforce owner is current user
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
