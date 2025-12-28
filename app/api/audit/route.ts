import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/audit - List all audits for organization
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const audits = await prisma.audit.findMany({
            where: { organizationId: context.orgId },
            orderBy: { createdAt: 'desc' },
            include: {
                findings: true,
                tests: true,
                _count: {
                    select: {
                        findings: true,
                        tests: true
                    }
                }
            }
        });

        return NextResponse.json({ audits });
    } catch (error: any) {
        console.error('Error fetching audits:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// POST /api/audit - Create new audit
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const body = await request.json();
        const { title, auditType, framework, scope, startDate, auditorName, auditorOrg } = body;

        if (!title || !auditType || !startDate || !auditorName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const audit = await prisma.audit.create({
            data: {
                title,
                auditType,
                framework,
                scope,
                startDate: new Date(startDate),
                auditorName,
                auditorOrg,
                status: 'planning',
                organizationId: context.orgId
            },
            include: {
                findings: true,
                tests: true
            }
        });

        return NextResponse.json({ audit }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating audit:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
