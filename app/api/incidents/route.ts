import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/incidents - List incidents with RBAC isolation
export async function GET(request: Request) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return new NextResponse('Unauthorized', { status: 401 });
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
        const { title, description, severity, assignedTo } = body;

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
