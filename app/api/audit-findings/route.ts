import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/audit-findings - List all audit findings with filters for the organization
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const auditId = searchParams.get('auditId');
        const severity = searchParams.get('severity');
        const status = searchParams.get('status');
        const controlId = searchParams.get('controlId');

        const whereClause: any = {
            audit: {
                organizationId: context.orgId
            }
        };

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
        const { message, status, code } = safeError(error, 'Audit Findings GET');
        return NextResponse.json({ error: message, code }, { status });
    }
}

// POST /api/audit-findings - Create new audit finding
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
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

        // Verify that the audit belongs to the organization
        const audit = await prisma.audit.findUnique({
            where: { id: auditId, organizationId: context.orgId }
        });

        if (!audit) {
            return NextResponse.json({ error: 'Audit not found or unauthorized.' }, { status: 404 });
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
        const { message, status, code } = safeError(error, 'Audit Findings POST');
        return NextResponse.json({ error: message, code }, { status });
    }
}
