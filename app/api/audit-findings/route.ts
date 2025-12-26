import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/audit-findings - List all audit findings with filters
export async function GET(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const auditId = searchParams.get('auditId');
        const severity = searchParams.get('severity');
        const status = searchParams.get('status');
        const controlId = searchParams.get('controlId');

        // DEV_MODE bypass or org filter
        const whereClause: any = {};
        if (process.env.DEV_MODE !== 'true' && orgId) {
            whereClause.audit = { organizationId: orgId };
        }

        if (auditId) whereClause.auditId = auditId;
        if (severity) whereClause.severity = severity;
        if (status) whereClause.status = status;
        if (controlId) whereClause.controlId = controlId;

        const findings = await prisma.auditFinding.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                audit: {
                    select: {
                        id: true,
                        title: true,
                        status: true
                    }
                },
                control: {
                    select: {
                        id: true,
                        title: true,
                        controlType: true
                    }
                }
            }
        });

        return NextResponse.json({ data: findings });
    } catch (error: any) {
        console.error('Error fetching audit findings:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/audit-findings - Create new audit finding
export async function POST(request: NextRequest) {
    try {
        const { userId, orgId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            auditId,
            controlId,
            severity,
            title,
            description,
            recommendation,
            dueDate,
            remediationPlan
        } = body;

        if (!auditId || !controlId || !severity || !title || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const finding = await prisma.auditFinding.create({
            data: {
                auditId,
                controlId,
                severity,
                title,
                description,
                recommendation,
                remediationPlan,
                dueDate: dueDate ? new Date(dueDate) : null,
                status: 'open'
            },
            include: {
                audit: true,
                control: true
            }
        });

        return NextResponse.json({ data: finding }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating audit finding:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
