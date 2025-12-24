import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { z } from 'zod';

// Input Validation Schema
const createIncidentSchema = z.object({
    title: z.string().min(5, "Title too short").max(200, "Title too long"),
    description: z.string().min(10, "Description too short").max(10000, "Description too long"),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
    assignedTo: z.string().email("Invalid assignee email").optional()
});

// GET /api/incidents - List incidents with RBAC isolation
export async function GET(request: Request) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const severity = searchParams.get('severity');

        // Expert RBAC: Admins/Managers see all in Org, Users see only their own
        // Note: For now, we'll stick to strict user isolation to fulfill the "mine only" request
        const whereClause: any = {
            ...getIsolationFilter(context, 'Incident')
        };

        if (severity) whereClause.severity = severity;

        const incidents = await prisma.incident.findMany({
            where: whereClause,
            include: {
                actions: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ incidents });
    } catch (error: any) {
        const { message, status } = safeError(error, 'Incidents GET');
        return NextResponse.json({ error: message }, { status });
    }
}

// POST /api/incidents - Create new incident with GRC relations
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate input
        const parseResult = createIncidentSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { title, description, severity, assignedTo } = parseResult.data;

        const incident = await prisma.incident.create({
            data: {
                title,
                description,
                severity,
                assignedTo,
                reportedBy: context.email,
                organizationId: context.orgId // Org-scoped IAM support
            }
        });

        // GRC Automation: Feedback loop to Risks
        try {
            const { linkIncidentToRisks } = await import('@/lib/grc-automation');
            await linkIncidentToRisks(incident.id, title, description, severity, context.email);
        } catch (error) {
            console.error('[Incidents] Automation failure:', error);
        }

        return NextResponse.json({ incident });
    } catch (error: any) {
        const { message, status } = safeError(error, 'Incidents POST');
        return NextResponse.json({ error: message }, { status });
    }
}
