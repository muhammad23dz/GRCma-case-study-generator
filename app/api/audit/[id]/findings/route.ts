import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/audit/[id]/findings - Get all findings for an audit
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const findings = await prisma.auditFinding.findMany({
            where: { auditId: id },
            include: {
                control: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        controlType: true,
                        controlRisk: true,
                        owner: true
                    }
                },
                audit: {
                    select: {
                        id: true,
                        title: true,
                        framework: true
                    }
                }
            },
            orderBy: [
                { severity: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json({ findings });
    } catch (error: any) {
        console.error('Error fetching findings:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/audit/[id]/findings - Create new finding
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { controlId, severity, title, description, recommendation, dueDate } = body;

        if (!controlId || !severity || !title || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const finding = await prisma.auditFinding.create({
            data: {
                auditId: id,
                controlId,
                severity,
                title,
                description,
                recommendation,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                status: 'open'
            },
            include: {
                control: true,
                audit: true
            }
        });

        // GRC Automation: Auto-create remediation action for critical/major findings
        if (['critical', 'major'].includes(severity.toLowerCase())) {
            try {
                const { linkFindingToRemediation } = await import('@/lib/grc-automation');
                const audit = await prisma.audit.findUnique({ where: { id } });
                await linkFindingToRemediation(
                    finding.id,
                    controlId,
                    severity.toLowerCase(),
                    audit?.organizationId || ''
                );
                console.log(`[GRC Automation] Created remediation action for finding: ${title}`);
            } catch (automationError) {
                console.error('[GRC Automation] Failed to create remediation:', automationError);
                // Non-blocking - don't fail the request
            }
        }

        return NextResponse.json({ finding }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating finding:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
