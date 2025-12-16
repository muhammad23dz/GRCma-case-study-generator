import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const DEV_MODE = process.env.DEV_MODE === 'true';

// GET /api/incidents
export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const userRole = (session.user as any).role || 'user';
        const isAdmin = ['admin', 'manager'].includes(userRole);
        const orgId = session.user.orgId;

        const whereClause: any = {};

        if (DEV_MODE) {
            // Show all in dev mode
        } else if (orgId) {
            whereClause.organizationId = orgId;
            if (!isAdmin) {
                whereClause.reportedBy = session.user.email;
            }
        } else {
            whereClause.reportedBy = session.user.email;
        }

        const incidents = await prisma.incident.findMany({
            where: whereClause,
            include: {
                actions: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ incidents });
    } catch (error: any) {
        console.error('Error fetching incidents:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/incidents
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
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
                reportedBy: session.user.email
            }
        });

        // GRC Automation: Incident Feedback Loop
        // Link critical incidents to potential risks
        try {
            const { linkIncidentToRisks } = await import('@/lib/grc-automation');
            await linkIncidentToRisks(incident.id, title, description, severity, session.user.email);
        } catch (error) {
            console.error('Failed to run Incident-Risk automation:', error);
        }

        return NextResponse.json({ incident });
    } catch (error: any) {
        console.error('Error creating incident:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
