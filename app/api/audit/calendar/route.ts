import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/audit/calendar - Get Audit Calendar Events
export async function GET(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null;

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || '';

        // Get audits with date ranges
        const audits = await prisma.audit.findMany({
            where: {
                OR: [
                    { auditorName: userEmail },
                    { organizationId: orgId || undefined }
                ]
            },
            include: {
                findings: {
                    select: { id: true, status: true }
                }
            },
            orderBy: { startDate: 'asc' }
        });

        // Get DR Tests (BCDR calendar events)
        const drTests = await prisma.dRTest.findMany({
            include: {
                plan: { select: { title: true, type: true } }
            },
            orderBy: { testDate: 'asc' }
        });

        // Get Training deadlines
        const trainingDeadlines = await prisma.trainingAssignment.findMany({
            where: {
                dueDate: { not: null },
                status: { not: 'completed' }
            },
            include: {
                course: { select: { title: true } },
                employee: { select: { name: true } }
            },
            orderBy: { dueDate: 'asc' }
        });

        // Build calendar events
        const events = [
            // Audits
            ...audits.map(audit => ({
                id: `audit-${audit.id}`,
                type: 'audit',
                title: audit.title,
                start: audit.startDate,
                end: audit.endDate,
                status: audit.status,
                metadata: {
                    findings: audit.findings?.length || 0,
                    openFindings: audit.findings?.filter(f => f.status === 'open').length || 0
                }
            })),
            // DR Tests
            ...drTests.map(test => ({
                id: `drtest-${test.id}`,
                type: 'drtest',
                title: `DR Test: ${test.title}`,
                start: test.testDate,
                end: test.testDate,
                status: test.status,
                metadata: {
                    planTitle: test.plan.title,
                    planType: test.plan.type,
                    testType: test.type
                }
            })),
            // Training Deadlines
            ...trainingDeadlines.map(ta => ({
                id: `training-${ta.id}`,
                type: 'training',
                title: `Training Due: ${ta.course.title}`,
                start: ta.dueDate,
                end: ta.dueDate,
                status: ta.status,
                metadata: {
                    course: ta.course.title,
                    employee: ta.employee.name
                }
            }))
        ].filter(e => {
            const eventDate = new Date(e.start!);
            if (month !== null) {
                return eventDate.getFullYear() === year && eventDate.getMonth() === month;
            }
            return eventDate.getFullYear() === year;
        });

        // Group by month
        const byMonth = events.reduce((acc, event) => {
            const date = new Date(event.start!);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[monthKey]) acc[monthKey] = [];
            acc[monthKey].push(event);
            return acc;
        }, {} as Record<string, typeof events>);

        return NextResponse.json({
            events,
            byMonth,
            summary: {
                totalEvents: events.length,
                audits: events.filter(e => e.type === 'audit').length,
                drTests: events.filter(e => e.type === 'drtest').length,
                trainingDeadlines: events.filter(e => e.type === 'training').length
            }
        });
    } catch (error: any) {
        console.error('Error fetching audit calendar:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
